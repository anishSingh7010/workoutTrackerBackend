import mongoose from 'mongoose';

export default function connectDB() {
  mongoose.connect(process.env.DATABASE_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  const db = mongoose.connection;
  db.once('open', () => console.log('Connected'));
  db.on('error', (err) => {
    console.error(`connection error: ${err}`);
  });

  return;
}
