import mongoose from 'mongoose';

let collection = 'users';
if (process.env.NODE_ENV === 'test') {
  collection = 'test';
}

export default function connectDB() {
  mongoose.connect(process.env.DATABASE_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  const db = mongoose.connection.useDb(collection);
  db.once('open', () =>
    console.log('Connected to database; Collection: ' + collection)
  );
  db.on('error', (err) => {
    console.error(`connection error: ${err}`);
  });

  return;
}
