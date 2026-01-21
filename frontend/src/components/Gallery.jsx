import { collection, query, where, getDocs } from "firebase/firestore";
import { db, auth } from "../firebase/firebase";
import { useEffect, useState } from "react";

export default function Gallery() {
  const [docs, setDocs] = useState([]);

  useEffect(() => {
    const load = async () => {
      const q = query(
        collection(db, "documents"),
        where("userId", "==", auth.currentUser.uid)
      );
      const snap = await getDocs(q);
      setDocs(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    };
    load();
  }, []);

  return docs.map(d => <div key={d.id}>{d.filename}</div>);
}
