const express = require('express');
const admin = require('./firebaseConfig'); // Import initialized Firebase Admin SDK

const app = express();
app.use(express.json());

const db = admin.firestore();
const FieldValue = admin.firestore.FieldValue;

app.post('/createUser', async (req, res) => {
  const { email, password, displayName, user_role } = req.body;

  if (!email || !password || !displayName || !user_role) {
    return res.status(400).send({ message: 'Missing required fields' });
  }

  try {
    // Create user without user_role
    const userRecord = await admin.auth().createUser({
      email: email,
      password: password,
      displayName: displayName,
    });

    // Optionally set custom user claims
    await admin.auth().setCustomUserClaims(userRecord.uid, { user_role: user_role });

    // Store user data in Firestore, using user_role from req.body
    await db.collection('users').doc(userRecord.uid).set({
      email: userRecord.email,
      displayName: userRecord.displayName,
      user_role: user_role,
      createdAt: FieldValue.serverTimestamp(),
    });

    res.status(201).send({ message: 'User created successfully', userId: userRecord.uid });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).send({ message: 'Error creating user', error: error.message });
  }
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
