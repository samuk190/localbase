import Localbase from "./localbase/localbase";

const db = new Localbase("db",{url:'ws://localhost:4000/listen'});

const main = async ()=>
{
  await db.collection("users").add({nombre: "Juan", edad: 25, sexo: "M"});
  await db.collection("users").get().then(users => console.log(users));
}

main();