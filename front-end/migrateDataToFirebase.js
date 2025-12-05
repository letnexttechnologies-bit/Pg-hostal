// Run this script once to migrate your existing pgList data to Firebase
// Usage: node migrateDataToFirebase.js

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import pgList from './src/data/pgList.js';

const firebaseConfig = {
  apiKey: "AIzaSyCcv4N5mtmhiWLCrGZi3_4nqwN3yH4azWU",
  authDomain: "pg-hostel-812d7.firebaseapp.com",
  projectId: "pg-hostel-812d7",
  storageBucket: "pg-hostel-812d7.firebasestorage.app",
  messagingSenderId: "724128889770",
  appId: "1:724128889770:web:b69da0c1c99252d7ecc9d3",
  measurementId: "G-7BRY4NE8ZS"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function migrateData() {
  console.log('Starting migration...');
  console.log('='.repeat(50));
  
  try {
    let count = 0;
    
    for (const pg of pgList) {
      // Add each PG to Firebase
      const docRef = await addDoc(collection(db, 'pgs'), {
        ...pg,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        isActive: true // Add status field for future use
      });
      
      count++;
      console.log(`✓ [${count}/${pgList.length}] Migrated: ${pg.name} (ID: ${docRef.id})`);
    }
    
    console.log('='.repeat(50));
    console.log('\n✅ Migration completed successfully!');
    console.log(`Total PGs migrated: ${pgList.length}`);
    console.log('\n🎉 You can now delete this migration script!');
    
    // Exit the process
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ Migration error:', error);
    console.error('\nPlease check:');
    console.error('1. Firebase config is correct');
    console.error('2. Internet connection is active');
    console.error('3. Firestore is enabled in Firebase Console');
    
    process.exit(1);
  }
}

migrateData();