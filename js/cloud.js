// LeakBase 클라우드 저장: Firebase 익명 로그인 + Firestore users/{내 ID} 문서 하나
// - 이 파일에 DB 코드를 모아 둔다. app.js는 load()와 save()만 부른다.
// - 설정값은 웹용 공개값이다. 접근 제한은 Firestore 보안 규칙(자기 ID 문서만 읽기·쓰기)이 맡는다.
// - 서비스 계정 키·비밀 키는 쓰지 않는다. 빌드 없이 gstatic CDN에서 버전을 고정해 불러온다.
const CONFIG = {
  apiKey: "AIzaSyBaPRipU1volBkbcF4VfYGikduuIxGqYxs",
  authDomain: "leakbase-18feb.firebaseapp.com",
  projectId: "leakbase-18feb",
  storageBucket: "leakbase-18feb.firebasestorage.app",
  messagingSenderId: "977896005648",
  appId: "1:977896005648:web:9dd3f51bf3d04258716a95",
};
const CDN = "https://www.gstatic.com/firebasejs/10.14.1/";
// 저장하는 항목: 사고 ID 배열(recent, cmp), 서비스 이름 배열(services), { 사고ID: [체크 번호] }(checks). 사고 내용은 저장하지 않는다.
const FIELDS = ["recent", "cmp", "services", "checks"];

let ready; // 한 번만 초기화
const init = () => ready || (ready = (async () => {
  const [A, Au, F] = await Promise.all([import(CDN + "firebase-app.js"), import(CDN + "firebase-auth.js"), import(CDN + "firebase-firestore.js")]);
  const app = A.initializeApp(CONFIG), auth = Au.getAuth(app);
  await auth.authStateReady();                       // 이 브라우저에 저장된 익명 ID가 있으면 그대로 쓴다
  if (!auth.currentUser) await Au.signInAnonymously(auth);
  return { F, ref: F.doc(F.getFirestore(app), "users", auth.currentUser.uid) };
})().catch((e) => { ready = null; throw e; }));

// 내 문서를 읽어 { recent, cmp, services, checks }로 돌려준다. 문서가 없으면 빈 객체.
export const load = async () => {
  const { F, ref } = await init();
  const snap = await F.getDoc(ref);
  return snap.exists() ? snap.data() : {};
};

// 4개 항목을 내 문서에 쓴다(문서 전체 교체). 규칙에 걸리거나 연결이 안 되면 오류를 던진다.
export const save = async (data) => {
  const { F, ref } = await init();
  const doc = { updatedAt: F.serverTimestamp() };
  FIELDS.forEach((k) => { doc[k] = data[k]; });
  await F.setDoc(ref, doc);
};
