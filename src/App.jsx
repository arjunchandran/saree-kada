import { createContext, useContext, useEffect, useState } from 'react';
import { fetchProducts } from './products';

const instagramUrl = 'https://www.instagram.com/auraform.studio/';
const heroImage = 'https://images.pexels.com/photos/36962415/pexels-photo-36962415.jpeg?auto=compress&cs=tinysrgb&w=1600';
const products = [
  {
    id: 'kasavu-saree',
    name: 'Kasavu Saree',
    price: '₹18,500',
    color: 'Ivory / zari cotton',
    composition: 'Handloom cotton with zari border',
    origin: 'Balaramapuram, Kerala',
    images: [
      'https://images.pexels.com/photos/36962415/pexels-photo-36962415.jpeg?auto=compress&cs=tinysrgb&w=1400',
      'https://images.pexels.com/photos/28752502/pexels-photo-28752502.jpeg?auto=compress&cs=tinysrgb&w=900',
      'https://images.pexels.com/photos/36949450/pexels-photo-36949450.jpeg?auto=compress&cs=tinysrgb&w=900'
    ]
  },
  {
    id: 'white-set-saree',
    name: 'Handwoven White Set Saree',
    price: '₹16,500',
    color: 'Mull white / cotton',
    composition: 'Handwoven Kerala cotton',
    origin: 'Kuthampully, Kerala',
    images: [
      'https://images.pexels.com/photos/29251866/pexels-photo-29251866.jpeg?auto=compress&cs=tinysrgb&w=1400',
      'https://images.pexels.com/photos/39322116/pexels-photo-39322116.jpeg?auto=compress&cs=tinysrgb&w=900'
    ]
  },
  {
    id: 'theyyam-silk-saree',
    name: 'Theyyam Silk Saree',
    price: '₹27,000',
    color: 'Vermilion / silk cotton',
    composition: 'Silk cotton with hand-finished border',
    origin: 'Kannur, Kerala',
    images: [
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1400&q=88',
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=900&q=88'
    ]
  }
];

const CatalogContext = createContext(products);

function Header({ active, bagCount }) {
  const [menuOpen, setMenuOpen] = useState(false);
  return <>
  <div className="utility-strip"><span>Handwoven in Kerala</span><span>Free delivery across India on orders over ₹5,000</span><a href={instagramUrl} target="_blank" rel="noreferrer">@auraform.studio ↗</a></div>
  <header className="site-header">
    <button className="menu-toggle" aria-label="Open menu" onClick={() => setMenuOpen(!menuOpen)}>☰</button>
      <a className="brand" href="#/"><span className="brand-name">SAREE KADA</span><span className="brand-sub">കേരളം · KERALA</span></a>
    <nav className={`main-nav ${menuOpen ? 'open' : ''}`} aria-label="Main navigation">
      <a className={active === 'shop' ? 'active' : ''} href="#/shop" onClick={() => setMenuOpen(false)}>Shop</a>
      <a className={active === 'about' ? 'active' : ''} href="#/about" onClick={() => setMenuOpen(false)}>About</a>
      <a href="#/journal" onClick={() => setMenuOpen(false)}>Journal</a>
    </nav>
    <div className="header-actions">
      <button aria-label="Search">Search</button>
      <a className="instagram-link" href={instagramUrl} target="_blank" rel="noreferrer">Instagram ↗</a>
      <button className="bag-button" aria-label="Shopping bag">Bag <span className="bag-count">{bagCount}</span></button>
    </div>
  </header></>;
}

function Footer() {
  return <footer className="site-footer"><span>© 2024 Saree Kada</span><span>Made by Arjun</span><a href={instagramUrl} target="_blank" rel="noreferrer">Follow @auraform.studio ↗</a></footer>;
}

function ProductCard({ product }) {
  return <a className="product-card" href={`#/product/${product.id}`}>
    <div className="product-image"><img src={product.images[0]} alt={product.name} loading="lazy" /></div>
    <div className="product-meta"><div><div className="product-name">{product.name}</div><div className="product-color">{product.color}</div></div><span className="product-price">{product.price}</span></div>
  </a>;
}

function Home({ bagCount }) {
  const products = useContext(CatalogContext);
  return <Page active="home" bagCount={bagCount}><main>
    <section className="hero"><div className="hero-copy"><div className="intro"><span className="eyebrow">Collection 04 / 2024</span><span className="kerala-kicker">From Kochi, with care</span><p>Clothes with a point of view. Designed for movement, made to last.</p></div><h1 className="display">The quiet<br />power of <em>form.</em></h1><div className="hero-actions"><a className="primary-cta" href="#/shop">Shop the collection <span>↗</span></a><a className="secondary-cta" href="#/about">Our craft story</a></div></div><div className="hero-image"><img className="hero-main-image" src={heroImage} alt="Woman wearing a handwoven saree" /><img className="hero-detail-image" src={products[1].images[0]} alt="Detail of a white handwoven Kerala saree" /><div className="hero-overlay"><span className="eyebrow">01 — The Kerala edit</span><strong>Soft ritual,<br />sharp presence.</strong></div><a className="hero-product" href={`#/product/${products[0].id}`}><span className="eyebrow">Featured saree</span><span className="hero-product-name">{products[0].name}</span><span className="hero-product-link">Discover piece ↗</span></a><span className="image-tag">Theyyam<br />in the<br />details</span></div></section>
    <section className="category-rail"><span className="eyebrow">Find your drape</span><a href="#/shop">Kasavu <span>Ivory + gold</span> ↗</a><a href="#/shop">Set sarees <span>Everyday white</span> ↗</a><a href="#/shop">Silk stories <span>Festival colour</span> ↗</a></section>
    <section className="section"><div className="section-head"><h2>New arrivals</h2><a className="text-link" href="#/shop">View all pieces ↗</a></div><div className="product-grid">{products.map(product => <ProductCard key={product.id} product={product} />)}</div></section>
    <section className="statement-band"><span className="eyebrow">Our philosophy · നമ്മുടെ വഴി</span><h2>Less noise.<br />More <em>presence.</em></h2><p className="band-copy">A wardrobe that supports the life you are already living. Natural cloth, considered colour, and the ease of a familiar ritual.</p><div className="band-footer"><span>01 — 03</span><span>Kathakali / കഥകളി ↘</span></div></section>
    <section className="newsletter"><h2>Stay in<br />the loop.</h2><div><p>Notes on clothing, culture, and the spaces between. Once a month, no noise.</p><Signup /><a className="social-link" href={instagramUrl} target="_blank" rel="noreferrer">See the studio on Instagram · @auraform.studio ↗</a></div></section>
  </main></Page>;
}

function Signup() {
  const [submitted, setSubmitted] = useState(false);
  return submitted ? <p className="signup-success">Welcome to the list.</p> : <form className="signup" onSubmit={event => { event.preventDefault(); setSubmitted(true); }}><input type="email" placeholder="Your email address" aria-label="Your email address" required /><button>Join ↗</button></form>;
}

function Shop({ bagCount }) {
  const products = useContext(CatalogContext);
  return <Page active="shop" bagCount={bagCount}><main><section className="page-intro"><span className="eyebrow">The saree collection · കേരളം</span><h1>Everyday<br /><em>ceremony.</em></h1></section><section className="section shop-section"><div className="section-head"><span className="eyebrow">03 sarees / handwoven in Kerala</span><span className="eyebrow">Filter + sort ↘</span></div><div className="product-grid">{products.map(product => <ProductCard key={product.id} product={product} />)}</div></section></main></Page>;
}

function ProductDetail({ product, bagCount, onAdd }) {
  const products = useContext(CatalogContext);
  const [size, setSize] = useState('Free');
  return <Page active="shop" bagCount={bagCount}><main><div className="detail-layout"><div className="detail-gallery">{product.images.map((image, index) => <img key={`${image}-${index}`} src={image} alt={`${product.name}, view ${index + 1}`} />)}</div><aside className="detail-info"><span className="eyebrow">Saree Kada / 0{products.indexOf(product) + 1}</span><h1>{product.name}</h1><span className="detail-price">{product.price}</span><p className="detail-copy">A five-metre handwoven saree with an easy drape, a clean blouse piece, and a border that carries the quiet ceremony of Kerala dressing.</p><div className="detail-rule"><div className="option-label"><span>Length</span><span>{size}</span></div><div className="sizes">{['Free', '5.5m', '6m'].map(option => <button className={`size ${size === option ? 'selected' : ''}`} key={option} onClick={() => setSize(option)}>{option}</button>)}</div></div><button className="add-button" onClick={onAdd}>Add to bag — {product.price}</button><div className="detail-note"><span>Free delivery over ₹5,000</span><span>Blouse piece included</span></div><div className="detail-rule"><a className="text-link" href={`#/product/${product.id}/description`}>Read the full description ↗</a></div></aside></div></main></Page>;
}

function Description({ product, bagCount }) {
  return <Page active="shop" bagCount={bagCount}><main><section className="description-hero"><div><span className="eyebrow">The story of the {product.name}</span><h1>Made for<br />the <em>in-between.</em></h1></div><div className="description-lede"><span className="eyebrow">01 / The idea</span><p>Not a costume. Not a trend. A handwoven saree you can live in, restyle, and return to for years.</p></div></section><section className="materials"><img className="materials-image" src={product.images[1]} alt={`Close view of ${product.name} saree fabric`} /><div className="materials-copy"><span className="eyebrow">02 / In the details · തെയ്യം</span><h2>Texture you<br />can feel.</h2><p>Inspired by Kerala's handloom tradition, the gold edge of a kasavu saree, and the vivid geometry of Theyyam, we choose cloth for the way it lives with you.</p><div className="spec-list"><div className="spec-row"><span>Composition</span><span>{product.composition}</span></div><div className="spec-row"><span>Woven in</span><span>{product.origin}</span></div><div className="spec-row"><span>Border</span><span>Hand-finished zari edge</span></div><div className="spec-row"><span>Care</span><span>Cold wash, hang dry</span></div><div className="spec-row"><span>Fit</span><span>5.5m saree + 0.8m blouse piece</span></div></div></div></section></main></Page>;
}

function About({ bagCount }) {
  return <Page active="about" bagCount={bagCount}><main><section className="about-intro"><span className="eyebrow">About Saree Kada · കൊച്ചി</span><h1>Clothing<br />with <em>clarity.</em></h1><p>We make fewer, better things for a life in motion. A wardrobe with space to breathe.</p><span className="about-mark">Theyyam<br />2018<br /><b>KOCHI</b></span></section><div className="about-image"><img src={heroImage} alt="Woman in a handwoven Kerala saree" /><span className="image-caption">Saree study / Kasavu, cotton, light</span></div><section className="about-grid"><h2>A practice in restraint.</h2><div><p>Saree Kada is an independent clothing studio rooted in Kochi. Our point of view comes from Kerala's coast: generous, tactile, and attuned to the weather.</p><p>We work with small weaving communities, natural fibers, and the patient pace of handwork. The drama belongs to the cloth: a kasavu border, a Theyyam red, a Kathakali green.</p><a className="about-social" href={instagramUrl} target="_blank" rel="noreferrer">Follow the studio journal on Instagram ↗</a><div className="quote"><span className="eyebrow">A note from the studio</span><p>“Good clothes do not ask for attention. They give it back to you.”</p></div></div></section></main></Page>;
}

function Journal({ bagCount }) {
  const stories = [
    { label: '01 / Craft', title: 'The gold edge of Kerala', copy: 'A closer look at the kasavu border and the patient hands behind it.', image: products[0].images[1] },
    { label: '02 / Ritual', title: 'Dressing for the in-between', copy: 'On everyday ceremony, monsoon light, and finding your own drape.', image: products[1].images[1] },
    { label: '03 / Place', title: 'Notes from Kannur', copy: 'Colour, rhythm, and the vivid visual language of Theyyam.', image: products[2].images[0] }
  ];
  return <Page active="journal" bagCount={bagCount}><main className="journal-page"><section className="page-intro"><span className="eyebrow">The journal · Kerala</span><h1>Notes from<br /><em>the coast.</em></h1></section><section className="journal-grid">{stories.map(story => <article className="journal-card" key={story.title}><img src={story.image} alt={story.title} /><div className="journal-card-copy"><span className="eyebrow">{story.label}</span><h2>{story.title}</h2><p>{story.copy}</p><a className="text-link" href="#/about">Read story ↗</a></div></article>)}</section></main></Page>;
}

function Page({ active, bagCount, children }) {
  return <div className="page"><Header active={active} bagCount={bagCount} />{children}<Footer /></div>;
}

function App() {
  const [bagCount, setBagCount] = useState(0);
  const [route, setRoute] = useState(window.location.hash);
  const [catalog, setCatalog] = useState(products);
  useEffect(() => { const updateRoute = () => setRoute(window.location.hash); window.addEventListener('hashchange', updateRoute); return () => window.removeEventListener('hashchange', updateRoute); }, []);
  useEffect(() => { window.scrollTo(0, 0); }, [route]);
  useEffect(() => { fetchProducts().then(setCatalog).catch(() => setCatalog(products)); }, []);
  const parts = route.replace(/^#\/?/, '').split('/').filter(Boolean);
  const product = catalog.find(item => item.id === parts[1]) || catalog[0];
  return <CatalogContext.Provider value={catalog}>
    {parts[0] === 'about' && <About bagCount={bagCount} />}
    {parts[0] === 'journal' && <Journal bagCount={bagCount} />}
    {parts[0] === 'shop' && <Shop bagCount={bagCount} />}
    {parts[0] === 'product' && parts[2] && <Description product={product} bagCount={bagCount} />}
    {parts[0] === 'product' && !parts[2] && <ProductDetail product={product} bagCount={bagCount} onAdd={() => setBagCount(count => count + 1)} />}
    {!parts[0] && <Home bagCount={bagCount} />}
  </CatalogContext.Provider>;
}

export default App;
