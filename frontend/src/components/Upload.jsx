import { ref, uploadBytes } from "firebase/storage";
import { storage, auth, db } from "../firebase/firebase";
import { collection, addDoc } from "firebase/firestore";

export default function Upload() {
  const uploadFile = async (file) => {
    const uid = auth.currentUser.uid;
    const fileRef = ref(storage, `uploads/${uid}/original/${file.name}`);
    await uploadBytes(fileRef, file);

    await addDoc(collection(db, "documents"), {
      userId: uid,
      filename: file.name,
      status: "uploaded",
      createdAt: Date.now()
    });
  };

  return <input type="file" onChange={e => uploadFile(e.target.files[0])} />;
}
