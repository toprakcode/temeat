"use client";

import { useState, useCallback } from "react";

/* ============ SHARED ============ */
const A = "#D4470A";

type LangKey = "tr" | "en" | "ar" | "de" | "ru";
type LangData = { l:string;s:string;add:string;cart:string;total:string;send:string;waiter:string;wifi:string;copied:string;empty:string;pop:string;nw:string;sp:string;vg:string;cal:string;notified:string;chef:string;prep:string;por:string;similar:string;interior:string;close:string;upgrade:string;c:string[]; };
type Item = { id:number;n:Record<string,string>;d:Record<string,string>;p:number;cal:number;prep:number;por:number;img:string;t:string[];disc:number;chef:boolean;sim:number[]; };

const LD: Record<LangKey, LangData> = {
  tr:{l:"Tr",s:"Ne arıyorsunuz?",add:"Ekle",cart:"Sepetim",total:"Toplam",send:"Siparişi Gönder",waiter:"Garson Çağır",wifi:"Ağ Şifresi",copied:"Kopyalandı",empty:"Sepetiniz boş",pop:"Favori",nw:"Yeni",sp:"Acılı",vg:"Bitkisel",cal:"kal",notified:"Garson haberdar edildi",chef:"Şefin Seçimi",prep:"dk",por:"Kişilik",similar:"Bunu Beğendiyseniz",interior:"Mekanımız",close:"×",upgrade:"Pro'ya Geç",c:["Başlangıç","Salata","Izgara","Tatlı","İçecek"]},
  en:{l:"En",s:"What are you looking for?",add:"Add",cart:"My Order",total:"Total",send:"Send Order",waiter:"Call Waiter",wifi:"WiFi Key",copied:"Copied",empty:"Empty",pop:"Popular",nw:"New",sp:"Spicy",vg:"Plant-based",cal:"cal",notified:"Waiter notified",chef:"Chef's Pick",prep:"min",por:"Serves",similar:"You May Also Like",interior:"Our Space",close:"×",upgrade:"Go Pro",c:["Starter","Salad","Grill","Dessert","Drink"]},
  ar:{l:"عر",s:"ماذا تبحث؟",add:"أضف",cart:"طلبي",total:"المجموع",send:"أرسل",waiter:"النادل",wifi:"كلمة المرور",copied:"تم",empty:"فارغ",pop:"مميز",nw:"جديد",sp:"حار",vg:"نباتي",cal:"سعرة",notified:"تم إبلاغ النادل",chef:"اختيار الشيف",prep:"د",por:"أشخاص",similar:"قد يعجبك",interior:"مكاننا",close:"×",upgrade:"Pro",c:["مقبلات","سلطة","مشاوي","حلوى","مشروب"]},
  de:{l:"De",s:"Was suchen Sie?",add:"Hinzu",cart:"Bestellung",total:"Gesamt",send:"Bestellen",waiter:"Kellner",wifi:"Passwort",copied:"Kopiert",empty:"Leer",pop:"Beliebt",nw:"Neu",sp:"Scharf",vg:"Pflanzlich",cal:"kcal",notified:"Kellner informiert",chef:"Empfehlung",prep:"Min",por:"Pers.",similar:"Das gefällt Ihnen",interior:"Unser Raum",close:"×",upgrade:"Pro",c:["Vorspeise","Salat","Grill","Dessert","Getränk"]},
  ru:{l:"Ру",s:"Что ищете?",add:"Доб.",cart:"Заказ",total:"Итого",send:"Отправить",waiter:"Официант",wifi:"Пароль",copied:"Скопировано",empty:"Пусто",pop:"Хит",nw:"Новинка",sp:"Острое",vg:"Растительное",cal:"кал",notified:"Официант вызван",chef:"Выбор шефа",prep:"мин",por:"Персон",similar:"Вам понравится",interior:"Наше место",close:"×",upgrade:"Pro",c:["Закуска","Салат","Гриль","Десерт","Напиток"]},
};

const ITEMS: Item[][] = [
  [{id:1,n:{tr:"Mercimek Çorbası",en:"Red Lentil Soup",ar:"شوربة عدس",de:"Linsensuppe",ru:"Чечевичный суп"},d:{tr:"Kırmızı mercimek · nane yağı · limon · kruton",en:"Red lentils · mint oil · lemon · croutons",ar:"عدس · نعناع · ليمون · خبز",de:"Linsen · Minzöl · Zitrone · Croutons",ru:"Чечевица · мята · лимон · гренки"},p:85,cal:220,prep:10,por:1,img:"https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&h=400&fit=crop&q=80",t:["pop","vg"],disc:0,chef:false,sim:[3,2]},
  {id:2,n:{tr:"Humus",en:"Hummus",ar:"حمص",de:"Hummus",ru:"Хумус"},d:{tr:"Nohut püresi · tahin · zeytinyağı · pide",en:"Chickpea · tahini · olive oil · flatbread",ar:"حمص · طحينة · زيت · خبز",de:"Kichererbsen · Tahini · Olivenöl · Brot",ru:"Нут · тахини · масло · лепёшка"},p:75,cal:180,prep:5,por:2,img:"https://images.unsplash.com/photo-1637949385162-e416fb15b2fb?w=400&h=400&fit=crop&q=80",t:["vg"],disc:0,chef:false,sim:[1,3]},
  {id:3,n:{tr:"Sigara Böreği",en:"Cheese Rolls",ar:"بوريك",de:"Käserollen",ru:"Бёрек"},d:{tr:"El açması yufka · lor · maydanoz · domates sosu",en:"Hand-rolled filo · curd · parsley · tomato sauce",ar:"عجين · جبن · بقدونس · صلصة",de:"Handgerollt · Quark · Petersilie · Sauce",ru:"Тесто · творог · петрушка · соус"},p:95,cal:310,prep:12,por:2,img:"https://images.unsplash.com/photo-1519864600857-ac42bde05e87?w=400&h=400&fit=crop&q=80",t:["pop"],disc:0,chef:false,sim:[1,2]}],
  [{id:4,n:{tr:"Çoban Salatası",en:"Shepherd's Salad",ar:"سلطة الراعي",de:"Hirtensalat",ru:"Чобан"},d:{tr:"Domates · salatalık · biber · sumak · zeytinyağı",en:"Tomato · cucumber · pepper · sumac · olive oil",ar:"طماطم · خيار · فلفل · سماق",de:"Tomate · Gurke · Paprika · Sumach",ru:"Помидор · огурец · перец · сумах"},p:70,cal:120,prep:5,por:2,img:"https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=400&fit=crop&q=80",t:["vg"],disc:0,chef:false,sim:[5]},
  {id:5,n:{tr:"Sezar Salata",en:"Caesar Salad",ar:"سلطة سيزر",de:"Caesar",ru:"Цезарь"},d:{tr:"Marul · parmesan · kruton · özel sos",en:"Romaine · parmesan · croutons · dressing",ar:"خس · بارميزان · خبز · صلصة",de:"Salat · Parmesan · Croutons · Dressing",ru:"Романо · пармезан · гренки · соус"},p:110,cal:280,prep:8,por:1,img:"https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=400&h=400&fit=crop&q=80",t:["pop"],disc:15,chef:false,sim:[4]}],
  [{id:6,n:{tr:"Adana Kebap",en:"Adana Kebab",ar:"كباب أضنة",de:"Adana Kebab",ru:"Адана"},d:{tr:"El kıyması kuzu · pul biber · lavaş · közlenmiş domates",en:"Hand-minced lamb · chili · lavash · grilled tomato",ar:"لحم مفروم · فلفل · لافاش · طماطم",de:"Handgehackt · Chili · Lavash · Grilltomate",ru:"Баранина · чили · лаваш · томат"},p:220,cal:450,prep:18,por:1,img:"https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400&h=400&fit=crop&q=80",t:["pop","sp"],disc:0,chef:true,sim:[9,7]},
  {id:7,n:{tr:"Kuzu Pirzola",en:"Lamb Chops",ar:"ريش ضأن",de:"Lammkoteletts",ru:"Каре ягнёнка"},d:{tr:"Biberiye · tereyağı · fırın patates",en:"Rosemary · butter · roasted potatoes",ar:"إكليل جبل · زبدة · بطاطس",de:"Rosmarin · Butter · Kartoffeln",ru:"Розмарин · масло · картофель"},p:320,cal:520,prep:25,por:1,img:"https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=400&h=400&fit=crop&q=80",t:[],disc:0,chef:false,sim:[6,9]},
  {id:8,n:{tr:"Tavuk Şiş",en:"Chicken Shish",ar:"شيش دجاج",de:"Hähnchen Şiş",ru:"Куриный шиш"},d:{tr:"24 saat marine · közlenmiş sebze · pilav",en:"24h marinated · grilled veg · rice",ar:"متبل 24 ساعة · خضروات · أرز",de:"24h mariniert · Gemüse · Reis",ru:"24ч маринад · овощи · рис"},p:180,cal:380,prep:20,por:1,img:"https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=400&fit=crop&q=80",t:["nw"],disc:20,chef:false,sim:[6,7]},
  {id:9,n:{tr:"İskender",en:"İskender",ar:"إسكندر",de:"İskender",ru:"Искендер"},d:{tr:"Döner · domates sosu · yoğurt · tereyağı · pide",en:"Döner · tomato sauce · yogurt · butter · flatbread",ar:"دونر · صلصة · زبادي · زبدة · خبز",de:"Döner · Tomatensauce · Joghurt · Butter · Brot",ru:"Донер · соус · йогурт · масло · лепёшка"},p:250,cal:580,prep:15,por:1,img:"https://images.unsplash.com/photo-1644789379364-23c3e07f0e9d?w=400&h=400&fit=crop&q=80",t:["pop"],disc:0,chef:true,sim:[6,7]}],
  [{id:10,n:{tr:"Künefe",en:"Künefe",ar:"كنافة",de:"Künefe",ru:"Кюнефе"},d:{tr:"Tel kadayıf · lor · Antep fıstığı · şerbet",en:"Shredded filo · cheese · pistachio · syrup",ar:"كنافة · جبن · فستق · شربات",de:"Fadennudeln · Käse · Pistazie · Sirup",ru:"Кадаиф · сыр · фисташки · сироп"},p:130,cal:420,prep:15,por:2,img:"https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?w=400&h=400&fit=crop&q=80",t:["pop"],disc:0,chef:true,sim:[11]},
  {id:11,n:{tr:"Baklava",en:"Baklava",ar:"بقلاوة",de:"Baklava",ru:"Пахлава"},d:{tr:"40 kat yufka · Antep fıstığı · hafif şerbet",en:"40 layers · pistachio · light syrup",ar:"40 طبقة · فستق · شربات",de:"40 Schichten · Pistazie · Sirup",ru:"40 слоёв · фисташки · сироп"},p:110,cal:380,prep:0,por:2,img:"https://images.unsplash.com/photo-1519676867240-f03562e64571?w=400&h=400&fit=crop&q=80",t:[],disc:10,chef:false,sim:[10]}],
  [{id:12,n:{tr:"Çay",en:"Tea",ar:"شاي",de:"Tee",ru:"Чай"},d:{tr:"Rize çayı · ince belli · kesme şeker",en:"Rize black tea · tulip glass · sugar",ar:"شاي أسود · كأس · سكر",de:"Schwarztee · Tulpenglas · Zucker",ru:"Чёрный чай · стакан · сахар"},p:25,cal:5,prep:4,por:1,img:"https://images.unsplash.com/photo-1597318181409-cf64d0b5d8a2?w=400&h=400&fit=crop&q=80",t:["pop"],disc:0,chef:false,sim:[14,13]},
  {id:13,n:{tr:"Ayran",en:"Ayran",ar:"عيران",de:"Ayran",ru:"Айран"},d:{tr:"Ev yapımı · köpüklü · buz gibi",en:"Homemade · frothy · ice-cold",ar:"منزلي · مخفوق · بارد",de:"Hausgemacht · schaumig · eiskalt",ru:"Домашний · взбитый · ледяной"},p:30,cal:60,prep:2,por:1,img:"https://images.unsplash.com/photo-1584273143981-41c073dfe8f8?w=400&h=400&fit=crop&q=80",t:[],disc:0,chef:false,sim:[12]},
  {id:14,n:{tr:"Kahve",en:"Coffee",ar:"قهوة",de:"Kaffee",ru:"Кофе"},d:{tr:"Orta şekerli · cezve · lokum ile",en:"Medium sweet · cezve · with lokum",ar:"وسط · جزوة · مع راحة",de:"Mittel süß · Cezve · mit Lokum",ru:"Средний · джезва · с лукумом"},p:50,cal:10,prep:6,por:1,img:"https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400&h=400&fit=crop&q=80",t:["pop"],disc:0,chef:false,sim:[12,13]}]
];

const INT = ["https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=200&fit=crop&q=80","https://images.unsplash.com/photo-1552566626-52f8b828add9?w=400&h=200&fit=crop&q=80","https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=200&fit=crop&q=80"];

const all: Item[] = ITEMS.flat();

function tC(t: string): string { return ({"pop":A,"nw":"#2563eb","sp":"#dc2626","vg":"#16a34a"} as Record<string,string>)[t] || "#999"; }

/* ============ MAIN APP ============ */
export default function DemoPage() {
  const [mode, setMode] = useState("pro");
  const [lang, setLang] = useState<LangKey>("tr");
  const [dk, setDk] = useState(false);
  const [cat, setCat] = useState(2);
  const [q, setQ] = useState("");
  const [cart, setCart] = useState<Record<number,number>>({});
  const [showCart, setShowCart] = useState(false);
  const [toast, setToast] = useState<string|null>(null);
  const [det, setDet] = useState<Item|null>(null);
  const [modal, setModal] = useState(false);

  const u = LD[lang];
  const o = dk ? 1 : 0;
  const C = {
    bg: ["#FAFAFA","#0B0B0B"][o], cd: ["#FFF","#161616"][o], bd: ["#EBEBEB","#232323"][o],
    tx: ["#111","#EDEDED"][o], s2: ["#555","#999"][o], mt: ["#999","#555"][o], dm: ["#CCC","#333"][o],
    al: ["#FFF5F0","#1C1210"][o]
  };

  const fl = useCallback(function(m: string) { setToast(m); setTimeout(function() { setToast(null); }, 1400); }, []);
  const ac = function(it: Item) { setCart(function(p) { const n = {...p}; n[it.id] = (n[it.id] || 0) + 1; return n; }); fl((it.n[lang] || it.n.en) + " ✓"); };
  const rc = function(it: Item) { setCart(function(p) { const n = {...p}; if (n[it.id] > 1) n[it.id]--; else delete n[it.id]; return n; }); };

  const cList = Object.entries(cart).map(function(e) { return { it: all.find(function(x) { return x.id === +e[0]; }), qty: e[1] as number }; }).filter(function(x): x is {it:Item,qty:number} { return !!x.it; });
  const cTotal = cList.reduce(function(s, c) { const p = c.it.disc ? Math.round(c.it.p * (1 - c.it.disc / 100)) : c.it.p; return s + p * c.qty; }, 0);
  const cCount = Object.values(cart).reduce(function(s, v) { return s + v; }, 0);
  const items = q ? all.filter(function(i) { return (i.n[lang] || i.n.en).toLowerCase().includes(q.toLowerCase()); }) : ITEMS[cat] || [];
  const chefs = all.filter(function(i) { return i.chef; });
  const isPro = mode === "pro";

  function tL(t: string) { return ({"pop":u.pop,"nw":u.nw,"sp":u.sp,"vg":u.vg} as Record<string,string>)[t] || t; }

  return (
    <div style={{ maxWidth: 430, margin: "0 auto", minHeight: "100vh", background: C.bg, fontFamily: "'Inter',system-ui,sans-serif", transition: "background .4s", position: "relative", color: C.tx }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,300..900&display=swap" rel="stylesheet" />
      <style>{`*{-webkit-tap-highlight-color:transparent;box-sizing:border-box}@keyframes si{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}@keyframes fi{from{opacity:0}to{opacity:1}}@keyframes su{from{transform:translateY(100%)}to{transform:translateY(0)}}@keyframes ti{0%{opacity:0;transform:translateX(-50%) scale(.95)}100%{opacity:1;transform:translateX(-50%) scale(1)}}.si{animation:si .4s cubic-bezier(.25,1,.5,1) both}.pr:active{transform:scale(.977);transition:transform .06s}::-webkit-scrollbar{display:none}`}</style>

      {toast && <div style={{ position: "fixed", top: 14, left: "50%", transform: "translateX(-50%)", zIndex: 200, animation: "ti .2s", background: C.cd, border: "1px solid " + C.bd, borderRadius: 100, padding: "7px 18px", boxShadow: "0 4px 20px rgba(0,0,0,.08)", fontSize: 12, fontWeight: 600, color: A, whiteSpace: "nowrap" }}>{toast}</div>}

      <div style={{ padding: "10px 16px", background: dk ? "#111" : "#FFF", borderBottom: "1px solid " + C.bd, display: "flex", gap: 4, overflowX: "auto", position: "sticky", top: 0, zIndex: 30 }}>
        {[{ id: "pro", label: "Müşteri Menüsü (Pro)" },{ id: "free", label: "Ücretsiz Menü" }].map(function(m) {
          return (
            <button key={m.id} onClick={function() { setMode(m.id); setCart({}); setShowCart(false); setDet(null); }}
              style={{ padding: "7px 14px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 10, fontWeight: mode === m.id ? 700 : 400, fontFamily: "inherit", background: mode === m.id ? A : "transparent", color: mode === m.id ? "#fff" : C.mt, whiteSpace: "nowrap", transition: "all .2s" }}>
              {m.label}
            </button>
          );
        })}
      </div>

      <div style={{ padding: "14px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid " + C.bd }}>
        <div style={{ fontSize: 14, fontWeight: 800, letterSpacing: "-.03em" }}>Sultanahmet Ocakbaşı</div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ display: "flex", borderRadius: 8, overflow: "hidden", border: "1px solid " + C.bd }}>
            {(Object.entries(LD) as [LangKey, LangData][]).map(function(e) {
              return <button key={e[0]} onClick={function() { setLang(e[0]); }} style={{ padding: "5px 8px", border: "none", cursor: "pointer", fontSize: 9, fontWeight: lang === e[0] ? 700 : 400, fontFamily: "inherit", background: lang === e[0] ? C.tx : "transparent", color: lang === e[0] ? C.bg : C.mt, minWidth: 26, textAlign: "center" }}>{e[1].l}</button>;
            })}
          </div>
          <button onClick={function() { setDk(!dk); }} style={{ width: 30, height: 30, borderRadius: 8, border: "1px solid " + C.bd, background: "transparent", cursor: "pointer", fontSize: 12, color: C.mt, display: "flex", alignItems: "center", justifyContent: "center" }}>{dk ? "◐" : "◑"}</button>
        </div>
      </div>

      <div style={{ padding: "18px 20px 12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <div style={{ display: "flex", gap: 2 }}>
            {[1,2,3,4].map(function(i) { return <div key={i} style={{ width: 5, height: 5, borderRadius: 99, background: A }} />; })}
            <div style={{ width: 5, height: 5, borderRadius: 99, background: C.dm }} />
          </div>
          <span style={{ fontSize: 11, fontWeight: 600 }}>4.7</span>
          <span style={{ color: C.dm }}>·</span>
          <span style={{ fontSize: 11, color: C.mt }}>Sultanahmet</span>
          <span style={{ color: C.dm }}>·</span>
          <span style={{ fontSize: 11, color: "#16a34a", fontWeight: 600 }}>●</span>
        </div>
        <div onClick={function() { navigator.clipboard && navigator.clipboard.writeText("sultanahmet2024"); fl(u.copied); }} style={{ display: "inline-flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
          <span style={{ fontSize: 10, color: C.mt, textTransform: "uppercase", letterSpacing: ".08em", fontWeight: 600 }}>{u.wifi}</span>
          <code style={{ fontSize: 11, fontWeight: 600, color: C.s2, background: C.cd, border: "1px solid " + C.bd, borderRadius: 6, padding: "3px 8px" }}>sultanahmet2024</code>
        </div>
      </div>

      <div style={{ padding: "8px 20px 0" }}>
        <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 8 }}>{u.interior}</div>
        <div style={{ display: "flex", gap: 6, overflowX: "auto" }}>
          {INT.map(function(s, i) { return <div key={i} style={{ width: 155, height: 88, borderRadius: 12, overflow: "hidden", flexShrink: 0 }}><img src={s} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /></div>; })}
        </div>
      </div>

      {isPro && !q && chefs.length > 0 && (
        <div style={{ padding: "20px 20px 0" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: A, marginBottom: 10, letterSpacing: ".06em", textTransform: "uppercase" }}>{u.chef}</div>
          <div style={{ display: "flex", gap: 10, overflowX: "auto" }}>
            {chefs.map(function(it) {
              const dp = it.disc ? Math.round(it.p * (1 - it.disc / 100)) : null;
              return (
                <div key={it.id} onClick={function() { setDet(it); }} style={{ width: 195, flexShrink: 0, cursor: "pointer" }}>
                  <div style={{ position: "relative", width: 195, height: 135, borderRadius: 14, overflow: "hidden", marginBottom: 8 }}>
                    <img src={it.img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top,rgba(0,0,0,.65) 0%,transparent 50%)" }} />
                    <div style={{ position: "absolute", top: 8, left: 8, background: "rgba(255,255,255,.15)", backdropFilter: "blur(6px)", borderRadius: 6, padding: "3px 8px", fontSize: 9, fontWeight: 700, color: "#fff" }}>★ {u.chef}</div>
                    <div style={{ position: "absolute", bottom: 8, left: 10 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{it.n[lang] || it.n.en}</div>
                      <div style={{ fontSize: 15, fontWeight: 800, color: "#fff", marginTop: 2 }}>₺{dp || it.p}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8, fontSize: 10, color: C.mt }}>
                    <span>{it.prep}{u.prep}</span><span>·</span><span>{it.por}{u.por}</span><span>·</span><span>{it.cal}{u.cal}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {!isPro && (
        <div onClick={function() { setModal(true); }} style={{ margin: "16px 20px 0", padding: "12px 14px", border: "1px dashed " + C.bd, borderRadius: 12, display: "flex", alignItems: "center", gap: 10, cursor: "pointer", opacity: .45 }}>
          <span style={{ fontSize: 14 }}>🔒</span>
          <div style={{ flex: 1 }}><div style={{ fontSize: 11, fontWeight: 600 }}>{u.chef}</div><div style={{ fontSize: 10, opacity: .7 }}>Pro özelliği</div></div>
          <span style={{ fontSize: 9, fontWeight: 700, color: A }}>Pro</span>
        </div>
      )}

      <div style={{ padding: "16px 20px 12px" }}>
        <div style={{ position: "relative" }}>
          <input type="text" value={q} onChange={function(e) { setQ(e.target.value); }} placeholder={u.s}
            style={{ width: "100%", padding: "12px 16px 12px 38px", borderRadius: 12, border: "1.5px solid " + (q ? A + "40" : C.bd), background: C.cd, color: C.tx, fontSize: 14, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }} />
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.mt} strokeWidth="2" strokeLinecap="round" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
          {q && <button onClick={function() { setQ(""); }} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: C.bd, border: "none", borderRadius: 99, width: 18, height: 18, cursor: "pointer", color: C.s2, fontSize: 9, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>}
        </div>
      </div>

      {!q && (
        <div style={{ padding: "0 20px 12px", display: "flex", borderBottom: "1px solid " + C.bd }}>
          {u.c.map(function(nm, i) {
            return <button key={i} onClick={function() { setCat(i); }} style={{ flex: 1, padding: "10px 0", border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 11, fontWeight: cat === i ? 700 : 400, color: cat === i ? C.tx : C.mt, background: "transparent", borderBottom: cat === i ? "2px solid " + C.tx : "2px solid transparent" }}>{nm}<span style={{ fontSize: 9, color: C.dm, marginLeft: 3 }}>({ITEMS[i].length})</span></button>;
          })}
        </div>
      )}

      <div style={{ padding: "4px 0 " + (cCount > 0 && isPro ? "130px" : !isPro ? "80px" : "70px") }}>
        {items.map(function(it, i) {
          const qty = cart[it.id] || 0;
          const dp = it.disc ? Math.round(it.p * (1 - it.disc / 100)) : null;
          return (
            <div key={it.id} className="si" style={{ padding: "0 20px", animationDelay: i * .03 + "s" }}>
              <div style={{ display: "flex", gap: 16, padding: "18px 0", borderBottom: "1px solid " + C.bd, alignItems: "flex-start" }}>
                <div style={{ flex: 1, minWidth: 0, paddingTop: 2 }}>
                  {isPro && it.t.length > 0 && <div style={{ display: "flex", gap: 6, marginBottom: 5 }}>{it.t.map(function(tg) { return <span key={tg} style={{ fontSize: 9, fontWeight: 600, color: tC(tg), letterSpacing: ".06em", textTransform: "uppercase" }}>{tL(tg)}</span>; })}</div>}
                  <div style={{ fontWeight: 600, fontSize: 16, lineHeight: 1.25, marginBottom: 4, letterSpacing: "-.02em", cursor: isPro ? "pointer" : "default" }} onClick={function() { if (isPro) setDet(it); }}>{it.n[lang] || it.n.en}</div>
                  <div style={{ fontSize: 12, color: C.mt, lineHeight: 1.4, marginBottom: 8, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{it.d[lang] || it.d.en}</div>
                  {isPro && <div style={{ display: "flex", gap: 8, marginBottom: 8, fontSize: 10, color: C.mt }}>{it.prep > 0 && <span>{it.prep}{u.prep}</span>}<span>{it.por}{u.por}</span><span>{it.cal}{u.cal}</span></div>}
                  <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                    <span style={{ fontSize: 18, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>{dp ? "₺" + dp : "₺" + it.p}</span>
                    {dp && <span style={{ fontSize: 12, color: C.dm, textDecoration: "line-through" }}>₺{it.p}</span>}
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, flexShrink: 0 }}>
                  <div onClick={function() { if (isPro) setDet(it); }} style={{ width: 100, height: 100, borderRadius: 16, overflow: "hidden", cursor: isPro ? "pointer" : "default", position: "relative" }}>
                    <img src={it.img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    {isPro && it.disc > 0 && <div style={{ position: "absolute", top: 5, left: 5, background: A, color: "#fff", fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 4 }}>-{it.disc}%</div>}
                  </div>
                  {isPro && (qty > 0 ? (
                    <div style={{ display: "flex", alignItems: "center", background: C.al, borderRadius: 10, border: "1.5px solid " + A + "20", width: 100 }}>
                      <button onClick={function() { rc(it); }} style={{ flex: 1, height: 32, border: "none", background: "none", cursor: "pointer", fontSize: 16, color: A }}>−</button>
                      <span style={{ fontWeight: 700, fontSize: 14, color: A, minWidth: 18, textAlign: "center" }}>{qty}</span>
                      <button onClick={function() { ac(it); }} style={{ flex: 1, height: 32, border: "none", background: A, cursor: "pointer", fontSize: 16, color: "#fff", borderRadius: "0 8px 8px 0" }}>+</button>
                    </div>
                  ) : (
                    <button onClick={function() { ac(it); }} className="pr" style={{ width: 100, height: 32, borderRadius: 10, border: "1.5px solid " + C.bd, background: C.cd, fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", color: C.tx }}>+ {u.add}</button>
                  ))}
                </div>
              </div>
            </div>
          );
        })}

        {!isPro && (
          <div style={{ padding: "20px 20px 0" }}>
            {["Sepet & WhatsApp Sipariş","Hazırlık Süresi & Porsiyon","Benzer Yemek Önerileri","İndirim & Kampanya","Logo Kaldırma"].map(function(f, i) {
              return (
                <div key={i} onClick={function() { setModal(true); }} style={{ margin: "0 0 10px", padding: "12px 14px", border: "1px dashed " + C.bd, borderRadius: 12, display: "flex", alignItems: "center", gap: 10, cursor: "pointer", opacity: .4 }}>
                  <span style={{ fontSize: 14 }}>🔒</span>
                  <span style={{ flex: 1, fontSize: 11, fontWeight: 600 }}>{f}</span>
                  <span style={{ fontSize: 9, fontWeight: 700, color: A }}>Pro</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div style={{ textAlign: "center", padding: 20, borderTop: "1px solid " + C.bd }}>
        {!isPro ? (
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: C.cd, border: "1px solid " + C.bd, borderRadius: 10, padding: "8px 16px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 2.5 }}><div style={{ width: 16, height: 2, background: A, borderRadius: 99 }} /><div style={{ width: 11, height: 2, background: A, borderRadius: 99 }} /><div style={{ width: 16, height: 2, background: A, borderRadius: 99 }} /></div>
            <div><div style={{ fontSize: 11, fontWeight: 700 }}>Powered by <span style={{ color: C.tx }}>TEM</span><span style={{ color: A }}>eat</span></div><div style={{ fontSize: 9, color: C.mt }}>temeat.com.tr</div></div>
          </div>
        ) : (
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><div style={{ display: "flex", flexDirection: "column", gap: 2 }}><div style={{ width: 12, height: 1.5, background: A, borderRadius: 99 }} /><div style={{ width: 8, height: 1.5, background: A, borderRadius: 99 }} /><div style={{ width: 12, height: 1.5, background: A, borderRadius: 99 }} /></div><span style={{ fontSize: 9, fontWeight: 700, letterSpacing: ".06em" }}><span style={{ color: C.dm }}>TEM</span><span style={{ color: A }}>EAT</span></span></div>
        )}
      </div>

      <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", maxWidth: 430, width: "100%", borderTop: "1px solid " + C.bd, background: C.bg, padding: "10px 20px 14px", display: "flex", gap: 8, zIndex: 20 }}>
        <button onClick={function() { fl(u.notified); }} className="pr" style={{ flex: 1, padding: 12, borderRadius: 12, border: "1.5px solid " + C.bd, background: C.cd, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", color: C.tx }}>{u.waiter}</button>
        {isPro && cCount > 0 && (
          <button onClick={function() { setShowCart(true); }} className="pr" style={{ flex: 2, padding: "12px 16px", borderRadius: 12, border: "none", background: A, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 4px 16px " + A + "30" }}>
            <span>{u.cart} · {cCount}</span><span style={{ fontWeight: 800 }}>₺{cTotal}</span>
          </button>
        )}
        {!isPro && (
          <button onClick={function() { setModal(true); }} className="pr" style={{ flex: 2, padding: 12, borderRadius: 12, border: "none", background: C.tx, color: C.bg, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>⚡ {u.upgrade}</button>
        )}
      </div>

      {showCart && (
        <div>
          <div onClick={function() { setShowCart(false); }} style={{ position: "fixed", inset: 0, background: dk ? "rgba(0,0,0,.6)" : "rgba(0,0,0,.25)", zIndex: 40, animation: "fi .15s" }} />
          <div style={{ position: "fixed", bottom: 0, left: "50%", marginLeft: -215, maxWidth: 430, width: "100%", background: C.cd, borderRadius: "20px 20px 0 0", zIndex: 50, maxHeight: "70vh", display: "flex", flexDirection: "column", animation: "su .3s cubic-bezier(.25,1,.5,1)" }}>
            <div style={{ width: 28, height: 3, borderRadius: 99, background: C.dm, margin: "10px auto 0" }} />
            <div style={{ padding: "14px 20px 10px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid " + C.bd }}>
              <span style={{ fontWeight: 700, fontSize: 15 }}>{u.cart}</span>
              <button onClick={function() { setShowCart(false); }} style={{ width: 28, height: 28, borderRadius: 8, border: "1px solid " + C.bd, background: "transparent", cursor: "pointer", fontSize: 12, color: C.mt, display: "flex", alignItems: "center", justifyContent: "center" }}>{u.close}</button>
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: "0 20px" }}>
              {cList.length === 0 ? <div style={{ textAlign: "center", padding: 40, color: C.mt, fontSize: 13 }}>{u.empty}</div>
              : cList.map(function(c) {
                const pr = c.it.disc ? Math.round(c.it.p * (1 - c.it.disc / 100)) : c.it.p;
                return (
                  <div key={c.it.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 0", borderBottom: "1px solid " + C.bd }}>
                    <img src={c.it.img} alt="" style={{ width: 48, height: 48, borderRadius: 10, objectFit: "cover" }} />
                    <div style={{ flex: 1 }}><div style={{ fontWeight: 600, fontSize: 13 }}>{c.it.n[lang] || c.it.n.en}</div><div style={{ fontSize: 12, color: C.mt }}>₺{pr}</div></div>
                    <div style={{ display: "flex", alignItems: "center", border: "1px solid " + C.bd, borderRadius: 8 }}>
                      <button onClick={function() { rc(c.it); }} style={{ width: 28, height: 28, border: "none", background: "none", cursor: "pointer", color: C.s2, fontSize: 14 }}>−</button>
                      <span style={{ minWidth: 16, textAlign: "center", fontSize: 12, fontWeight: 700 }}>{c.qty}</span>
                      <button onClick={function() { ac(c.it); }} style={{ width: 28, height: 28, border: "none", background: "none", cursor: "pointer", color: C.s2, fontSize: 14 }}>+</button>
                    </div>
                    <span style={{ fontWeight: 700, fontSize: 14, minWidth: 48, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>₺{pr * c.qty}</span>
                  </div>
                );
              })}
            </div>
            {cList.length > 0 && (
              <div style={{ padding: "14px 20px 28px", borderTop: "1px solid " + C.bd }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 16 }}>
                  <span style={{ fontSize: 13, color: C.mt }}>{u.total}</span>
                  <span style={{ fontSize: 26, fontWeight: 800, fontVariantNumeric: "tabular-nums" }}>₺{cTotal}</span>
                </div>
                <button onClick={function() { let m = "🍽️ *Sultanahmet Ocakbaşı*\n\n"; cList.forEach(function(c) { const pr = c.it.disc ? Math.round(c.it.p * (1 - c.it.disc / 100)) : c.it.p; m += c.qty + "× " + (c.it.n[lang] || c.it.n.en) + "  ₺" + (pr * c.qty) + "\n"; }); m += "\n" + u.total + ": ₺" + cTotal; window.open("https://wa.me/905551234567?text=" + encodeURIComponent(m), "_blank"); }} className="pr"
                  style={{ width: "100%", padding: 15, borderRadius: 12, border: "none", background: "#25D366", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>{u.send}</button>
              </div>
            )}
          </div>
        </div>
      )}

      {det && isPro && (
        <div>
          <div onClick={function() { setDet(null); }} style={{ position: "fixed", inset: 0, background: dk ? "rgba(0,0,0,.6)" : "rgba(0,0,0,.25)", zIndex: 60, animation: "fi .15s" }} />
          <div style={{ position: "fixed", bottom: 0, left: "50%", marginLeft: -215, maxWidth: 430, width: "100%", background: C.cd, borderRadius: "20px 20px 0 0", zIndex: 70, animation: "su .3s cubic-bezier(.25,1,.5,1)", maxHeight: "85vh", overflowY: "auto" }}>
            <div style={{ width: 28, height: 3, borderRadius: 99, background: C.dm, margin: "10px auto 6px" }} />
            <img src={det.img} alt="" style={{ width: "100%", height: 220, objectFit: "cover" }} />
            <button onClick={function() { setDet(null); }} style={{ position: "absolute", top: 20, right: 16, width: 30, height: 30, borderRadius: 99, background: "rgba(0,0,0,.3)", border: "none", cursor: "pointer", color: "#fff", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>{u.close}</button>
            <div style={{ padding: "16px 20px 28px" }}>
              {det.t.length > 0 && <div style={{ display: "flex", gap: 6, marginBottom: 6 }}>{det.t.map(function(tg) { return <span key={tg} style={{ fontSize: 9, fontWeight: 600, color: tC(tg), letterSpacing: ".06em", textTransform: "uppercase" }}>{tL(tg)}</span>; })}</div>}
              <h2 style={{ fontSize: 22, fontWeight: 700, margin: "0 0 8px", letterSpacing: "-.03em" }}>{det.n[lang] || det.n.en}</h2>
              <div style={{ display: "flex", gap: 12, marginBottom: 12, fontSize: 11, color: C.mt }}>{det.prep > 0 && <span>{det.prep}{u.prep}</span>}<span>{det.por}{u.por}</span><span>{det.cal}{u.cal}</span></div>
              <p style={{ fontSize: 13, color: C.s2, margin: "0 0 18px", lineHeight: 1.65 }}>{det.d[lang] || det.d.en}</p>
              {det.sim && det.sim.length > 0 && (
                <div style={{ marginBottom: 18 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 8 }}>{u.similar}</div>
                  <div style={{ display: "flex", gap: 8 }}>
                    {det.sim.map(function(sid) {
                      const si = all.find(function(x) { return x.id === sid; });
                      if (!si) return null;
                      return (
                        <div key={sid} onClick={function() { setDet(si); }} style={{ display: "flex", alignItems: "center", gap: 8, background: C.bg, border: "1px solid " + C.bd, borderRadius: 10, padding: 8, cursor: "pointer", flex: 1 }}>
                          <img src={si.img} alt="" style={{ width: 36, height: 36, borderRadius: 8, objectFit: "cover" }} />
                          <div><div style={{ fontSize: 11, fontWeight: 600, lineHeight: 1.2 }}>{si.n[lang] || si.n.en}</div><div style={{ fontSize: 11, fontWeight: 700, color: A }}>₺{si.p}</div></div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 0 0", borderTop: "1px solid " + C.bd }}>
                <div>{det.disc ? <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}><span style={{ fontSize: 24, fontWeight: 800 }}>₺{Math.round(det.p * (1 - det.disc / 100))}</span><span style={{ fontSize: 14, color: C.dm, textDecoration: "line-through" }}>₺{det.p}</span></div> : <span style={{ fontSize: 24, fontWeight: 800 }}>₺{det.p}</span>}</div>
                <button onClick={function() { ac(det); setDet(null); }} className="pr" style={{ padding: "12px 32px", borderRadius: 12, border: "none", background: A, color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>+ {u.add}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {modal && (
        <div>
          <div onClick={function() { setModal(false); }} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.4)", zIndex: 80, animation: "fi .15s" }} />
          <div style={{ position: "fixed", bottom: 0, left: "50%", marginLeft: -215, maxWidth: 430, width: "100%", background: C.cd, borderRadius: "20px 20px 0 0", zIndex: 90, animation: "su .3s cubic-bezier(.25,1,.5,1)" }}>
            <div style={{ width: 28, height: 3, borderRadius: 99, background: C.dm, margin: "10px auto 0" }} />
            <div style={{ padding: "20px 24px" }}>
              <div style={{ textAlign: "center", marginBottom: 20 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: A, margin: "0 auto 10px", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 3 }}><div style={{ width: 18, height: 2, background: "#fff", borderRadius: 99 }} /><div style={{ width: 12, height: 2, background: "#fff", borderRadius: 99 }} /><div style={{ width: 18, height: 2, background: "#fff", borderRadius: 99 }} /></div>
                <h2 style={{ fontSize: 18, fontWeight: 800, margin: "0 0 4px" }}><span>TEM</span><span style={{ color: A }}>eat</span> Pro</h2>
                <p style={{ fontSize: 12, color: C.mt, margin: 0 }}>Restoranınızı dijitalde büyütün</p>
              </div>
              <div style={{ marginBottom: 16 }}>
                {[["Sınırsız ürün","15","∞"],["Sepet & Sipariş","—","✓"],["Şefin Seçimi","—","✓"],["Fotoğraf Galerisi","1","∞"],["Süre & Porsiyon","—","✓"],["Benzer Öneriler","—","✓"],["Kampanyalar","—","✓"],["Logo Kaldırma","—","✓"],["Analitik","—","✓"]].map(function(r, i) {
                  return (
                    <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 50px 50px", padding: "6px 0", borderBottom: i < 8 ? "1px solid " + C.bd : "none" }}>
                      <span style={{ fontSize: 11 }}>{r[0]}</span>
                      <span style={{ fontSize: 11, color: C.dm, textAlign: "center" }}>{r[1]}</span>
                      <span style={{ fontSize: 11, color: A, textAlign: "center", fontWeight: 600 }}>{r[2]}</span>
                    </div>
                  );
                })}
              </div>
              <div style={{ background: C.bg, borderRadius: 12, padding: 14, textAlign: "center", marginBottom: 14, border: "1px solid " + C.bd }}>
                <span style={{ fontSize: 28, fontWeight: 800 }}>₺199</span>
                <span style={{ fontSize: 12, color: C.mt }}>/ay</span>
                <div style={{ fontSize: 10, color: C.mt, marginTop: 4 }}>14 gün ücretsiz · İstediğin zaman iptal</div>
              </div>
              <button className="pr" style={{ width: "100%", padding: 14, borderRadius: 12, border: "none", background: A, color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>14 Gün Ücretsiz Dene</button>
              <button onClick={function() { setModal(false); }} style={{ width: "100%", padding: 10, marginTop: 6, background: "transparent", border: "none", color: C.mt, fontSize: 11, cursor: "pointer", fontFamily: "inherit" }}>Ücretsiz devam et</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}