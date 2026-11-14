import { createContext, lazy, Suspense, useContext, useEffect, useRef, useState } from 'react';
import { fetchProducts, localProducts } from './products';
import { filterProducts, getCategories } from './catalogFilters';
import { addBagItem, changeBagQuantity, removeBagItem } from './bag';

const KathakaliMiniature = lazy(() => import('./KathakaliMiniature'));

const instagramUrl = 'https://www.instagram.com/kishabysree/';
const kishabySreeLogoUrl = '/kishabySree-logo.png';
const heroImage = 'https://images.pexels.com/photos/36962415/pexels-photo-36962415.jpeg?auto=compress&cs=tinysrgb&w=1600';
const CatalogContext = createContext(localProducts);

function ArrowIcon({ direction = 'up-right' }) {
  const paths = {
    'up-right': 'M5 19 19 5 M12 6.5 19 5 17.5 12',
    'down-right': 'M5 5 19 19 M12 17.5 19 19 17.5 12',
    down: 'M12 4v15 M6.5 14 12 19 17.5 14'
  };
  return <svg className="arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false"><path d={paths[direction]} /></svg>;
}

function Header({ active, bagCount }) {
  const [menuOpen, setMenuOpen] = useState(false);
  return <>
  <div className="utility-strip"><span>Handwoven in Kerala</span><span>Free delivery across India on orders over ₹5,000</span><a href={instagramUrl} target="_blank" rel="noreferrer">@kishabysree <ArrowIcon /></a></div>
  <header className="site-header">
    <button className="menu-toggle" aria-label="Open menu" onClick={() => setMenuOpen(!menuOpen)}>☰</button>
      <a className="brand" href="#/" aria-label="KishabySree home">
        <img className="brand-logo" src={kishabySreeLogoUrl} alt="KishabySree logo" referrerPolicy="no-referrer" />
        <span className="brand-name">KISHABYSREE</span>
        <span className="brand-sub">കേരളം · KERALA</span>
      </a>
    <nav className={`main-nav ${menuOpen ? 'open' : ''}`} aria-label="Main navigation">
      <a className={active === 'shop' ? 'active' : ''} href="#/shop" onClick={() => setMenuOpen(false)}>Shop</a>
      <a className={active === 'about' ? 'active' : ''} href="#/about" onClick={() => setMenuOpen(false)}>About</a>
      <a className={active === 'journal' ? 'active' : ''} href="#/journal" onClick={() => setMenuOpen(false)}>Journal</a>
    </nav>
    <div className="header-actions">
      <button aria-label="Search">Search</button>
      <a className="instagram-link" href={instagramUrl} target="_blank" rel="noreferrer">Instagram <ArrowIcon /></a>
      <a className={`bag-button ${active === 'bag' ? 'active' : ''}`} href="#/bag" aria-label="Shopping bag">Bag <span className="bag-count">{bagCount}</span></a>
    </div>
  </header></>;
}

function Footer() {
  return <footer className="site-footer"><span>© 2024 KishabySree</span><a href={instagramUrl} target="_blank" rel="noreferrer">Follow @kishabysree <ArrowIcon /></a></footer>;
}

function ProductCard({ product }) {
  return <a className="product-card" href={`#/product/${product.id}`}>
    <div className="product-image"><img src={product.images[0]} alt={product.name} loading="lazy" /></div>
    <div className="product-meta"><div><div className="product-name">{product.name}</div><div className="product-color">{product.color}</div></div><span className="product-price">{product.price}</span></div>
  </a>;
}

function Home({ bagCount }) {
  const products = useContext(CatalogContext);
  const garments = getCategories(products, 'collective-category');
  return <Page active="home" bagCount={bagCount}><main>
    <section className="hero">
      <div className="hero-media" aria-hidden="true"><img src={heroImage} alt="" /></div>
      <div className="hero-content">
        <div className="hero-topline"><span>KishabySree / The collection</span><span>Kochi, Kerala</span></div>
        <div className="hero-copy">
          <p className="hero-kicker"><span aria-hidden="true" /> A little tradition. A little today.</p>
          <h1>Clothes<br /><em>that feel</em><br />like you.</h1>
          <p className="hero-description">Thoughtful pieces for every version of you. Inspired by our roots, made for your everyday.</p>
          <div className="hero-actions"><a className="primary-cta" href="#/shop">Explore the collection <ArrowIcon /></a><a className="secondary-cta" href="#/about">Discover our story <ArrowIcon /></a></div>
          <a className="hero-social" href={instagramUrl} target="_blank" rel="noreferrer"><span>Follow us on Instagram</span><strong>@kishabysree <ArrowIcon /></strong></a>
        </div>
        <div className="hero-bottomline"><span>Crafted with a point of view</span><span>Scroll to discover <ArrowIcon direction="down" /></span></div>
      </div>
    </section>
    {garments.length > 0 && <section className="category-rail"><span className="eyebrow">Shop by garment</span>{garments.map(category => {
      const count = filterProducts(products, category, '').length;
      return <a key={category} href={`#/shop?garment=${encodeURIComponent(category)}`}>{category}<span>{count} {count === 1 ? 'piece' : 'pieces'}</span> <ArrowIcon /></a>;
    })}</section>}
    <section className="section home-arrivals"><div className="section-head"><h2>New arrivals</h2><a className="text-link" href="#/shop">View all pieces <ArrowIcon /></a></div><div className="product-grid">{products.map(product => <ProductCard key={product.id} product={product} />)}</div></section>
    <section className="statement-band"><span className="eyebrow">Our philosophy · നമ്മുടെ വഴി</span><h2>Less noise.<br />More <em>presence.</em></h2><p className="band-copy">A wardrobe that supports the life you are already living. Natural cloth, considered colour, and the ease of a familiar ritual.</p><div className="band-footer"><span>01 — 03</span><span>Kathakali / കഥകളി <ArrowIcon direction="down-right" /></span></div></section>
    <section className="newsletter"><h2>Stay in<br />the loop.</h2><div><p>Notes on clothing, culture, and the spaces between. Once a month, no noise.</p><Signup /><a className="social-link" href={instagramUrl} target="_blank" rel="noreferrer">See the studio on Instagram · @kishabysree <ArrowIcon /></a></div></section>
  </main></Page>;
}

function Signup() {
  const [submitted, setSubmitted] = useState(false);
  return submitted ? <p className="signup-success">Welcome to the list.</p> : <form className="signup" onSubmit={event => { event.preventDefault(); setSubmitted(true); }}><input type="email" placeholder="Your email address" aria-label="Your email address" required /><button>Join <ArrowIcon /></button></form>;
}

function Shop({ bagCount, initialGarment }) {
  const products = useContext(CatalogContext);
  const [collectiveCategory, setCollectiveCategory] = useState(initialGarment);
  const [productCategory, setProductCategory] = useState('');
  useEffect(() => { setCollectiveCategory(initialGarment); }, [initialGarment]);
  const garments = getCategories(products, 'collective-category');
  const occasions = getCategories(products, 'product-category');
  const visibleProducts = filterProducts(products, collectiveCategory, productCategory);
  return <Page active="shop" bagCount={bagCount}><main><section className="page-intro"><span className="eyebrow">The collection · കേരളം</span><h1>Everyday<br /><em>ceremony.</em></h1></section><section className="section shop-section">
    <div className="shop-filters">
      <label>Garment<select value={collectiveCategory} onChange={event => setCollectiveCategory(event.target.value)}><option value="">All garments</option>{garments.map(category => <option key={category} value={category}>{category}</option>)}</select></label>
      <label>Occasion<select value={productCategory} onChange={event => setProductCategory(event.target.value)}><option value="">All occasions</option>{occasions.map(category => <option key={category} value={category}>{category}</option>)}</select></label>
      <span className="eyebrow" aria-live="polite">{visibleProducts.length} {visibleProducts.length === 1 ? 'piece' : 'pieces'}</span>
    </div>
    {visibleProducts.length ? <div className="product-grid">{visibleProducts.map(product => <ProductCard key={product.id} product={product} />)}</div> : <p className="shop-empty">No pieces match these filters. Try another combination.</p>}
  </section></main></Page>;
}

function ProductDetail({ product, bagCount, onAdd }) {
  const products = useContext(CatalogContext);
  const [size, setSize] = useState('Free');
  const isSaree = !product['collective-category'] || product['collective-category'] === 'Saree';
  if (!isSaree) {
    return <Page active="shop" bagCount={bagCount}><main><div className="detail-layout"><div className="detail-gallery">{product.images.map((image, index) => <img key={`${image}-${index}`} src={image} alt={`${product.name}, view ${index + 1}`} />)}</div><aside className="detail-info">
      <span className="eyebrow">{product['collective-category']}{product['product-category'] ? ` / ${product['product-category']}` : ''}</span><h1>{product.name}</h1><span className="detail-price">{product.price}</span>
      <p className="detail-copy">{product.description || `${product.color} · ${product.composition}`}</p>
      <div className="detail-rule"><div className="option-label"><span>Composition</span><span>{product.composition}</span></div><div className="option-label"><span>Origin</span><span>{product.origin}</span></div></div>
      <button className="add-button" onClick={() => onAdd()}>Add to bag — {product.price}</button>
      <div className="detail-rule"><a className="text-link" href={`#/product/${product.id}/description`}>Read the full description <ArrowIcon /></a></div>
    </aside></div></main></Page>;
  }
  return <Page active="shop" bagCount={bagCount}><main><div className="detail-layout"><div className="detail-gallery">{product.images.map((image, index) => <img key={`${image}-${index}`} src={image} alt={`${product.name}, view ${index + 1}`} />)}</div><aside className="detail-info"><span className="eyebrow">KishabySree / 0{products.indexOf(product) + 1}</span><h1>{product.name}</h1><span className="detail-price">{product.price}</span><p className="detail-copy">{product.demo ? product.description : 'A five-metre handwoven saree with an easy drape, a clean blouse piece, and a border that carries the quiet ceremony of Kerala dressing.'}</p>{!product.demo && <div className="detail-rule"><div className="option-label"><span>Length</span><span>{size}</span></div><div className="sizes">{['Free', '5.5m', '6m'].map(option => <button type="button" className={`size ${size === option ? 'selected' : ''}`} aria-pressed={size === option} key={option} onClick={() => setSize(option)}>{option}</button>)}</div></div>}<button className="add-button" onClick={() => onAdd(product.demo ? undefined : size)}>Add to bag — {product.price}</button>{!product.demo && <div className="detail-note"><span>Free delivery over ₹5,000</span><span>Blouse piece included</span></div>}<div className="detail-rule"><a className="text-link" href={`#/product/${product.id}/description`}>Read the full description <ArrowIcon /></a></div></aside></div></main></Page>;
}

function Description({ product, bagCount }) {
  if (product.demo || (product['collective-category'] && product['collective-category'] !== 'Saree')) {
    return <Page active="shop" bagCount={bagCount}><main><section className="description-hero"><div><span className="eyebrow">The story of the {product.name}</span><h1>Made for<br /><em>the in-between.</em></h1></div><div className="description-lede"><span className="eyebrow">{product['collective-category']}{product['product-category'] ? ` / ${product['product-category']}` : ''}</span><p>{product.description || `${product.color} · ${product.composition}`}</p></div></section><section className="materials"><img className="materials-image" src={product.images[1] || product.images[0]} alt={`${product.name}, detail view`} /><div className="materials-copy"><span className="eyebrow">In the details</span><h2>Considered<br />for you.</h2><div className="spec-list"><div className="spec-row"><span>Composition</span><span>{product.composition}</span></div><div className="spec-row"><span>Origin</span><span>{product.origin}</span></div><div className="spec-row"><span>Colour</span><span>{product.color}</span></div></div></div></section></main></Page>;
  }
  return <Page active="shop" bagCount={bagCount}><main><section className="description-hero"><div><span className="eyebrow">The story of the {product.name}</span><h1>Made for<br />the <em>in-between.</em></h1></div><div className="description-lede"><span className="eyebrow">01 / The idea</span><p>Not a costume. Not a trend. A handwoven saree you can live in, restyle, and return to for years.</p></div></section><section className="materials"><img className="materials-image" src={product.images[1] || product.images[0]} alt={`Close view of ${product.name} saree fabric`} /><div className="materials-copy"><span className="eyebrow">02 / In the details · തെയ്യം</span><h2>Texture you<br />can feel.</h2><p>Inspired by Kerala's handloom tradition, the gold edge of a kasavu saree, and the vivid geometry of Theyyam, we choose cloth for the way it lives with you.</p><div className="spec-list"><div className="spec-row"><span>Composition</span><span>{product.composition}</span></div><div className="spec-row"><span>Woven in</span><span>{product.origin}</span></div><div className="spec-row"><span>Border</span><span>Hand-finished zari edge</span></div><div className="spec-row"><span>Care</span><span>Cold wash, hang dry</span></div><div className="spec-row"><span>Fit</span><span>5.5m saree + 0.8m blouse piece</span></div></div></div></section></main></Page>;
}

function BagPage({ bagItems, bagCount, onClear, onRemoveItem, onChangeQuantity }) {
  const products = useContext(CatalogContext);
  const subtotal = bagItems.reduce((sum, item) => {
    const priceNumber = Number(String(item.price).replace(/[^\d]/g, '')) || 0;
    return sum + (priceNumber * item.quantity);
  }, 0);

  return <Page active="bag" bagCount={bagCount}><main className="bag-page"><section className="page-intro"><span className="eyebrow">Your bag · കേരളം</span><h1>Collected with care.</h1></section>{bagItems.length === 0 ? <section className="empty-bag"><p>Your shopping bag is empty.</p><a className="primary-cta" href="#/shop">Continue shopping</a></section> : <section className="bag-layout"><div className="bag-items">{bagItems.map(item => {
    const itemLabel = `${item.name}${item.size ? `, length ${item.size}` : ''}`;
    return <article className="bag-item" key={JSON.stringify([item.id, item.size ?? null])}><div className="bag-item-image"><img src={products.find(product => product.id === item.id)?.images[0] || heroImage} alt={item.name} /></div><div className="bag-item-copy"><div><h2>{item.name}</h2><p>{item.color || 'Handwoven Kerala saree'}</p>{item.size && <p>Length: {item.size}</p>}</div><div className="bag-item-meta"><div className="bag-quantity" role="group" aria-label={`Quantity for ${itemLabel}`}><button type="button" aria-label={`Decrease quantity of ${itemLabel}`} onClick={() => onChangeQuantity(item.id, item.size, -1)}>-</button><span aria-live="polite">{item.quantity}</span><button type="button" aria-label={`Increase quantity of ${itemLabel}`} onClick={() => onChangeQuantity(item.id, item.size, 1)}>+</button></div><button type="button" onClick={() => onRemoveItem(item.id, item.size)} aria-label={`Remove ${itemLabel} from bag`}>Remove</button></div></div><strong>{item.price}{item.quantity > 1 && <span className="bag-item-unit"> / each</span>}</strong></article>;
  })}<button type="button" className="secondary-button" onClick={onClear}>Clear bag</button></div><aside className="bag-summary"><span className="eyebrow">Summary</span><div className="summary-row"><span>Subtotal</span><span>₹{subtotal.toLocaleString('en-IN')}</span></div><div className="summary-row"><span>Shipping</span><span>Calculated at checkout</span></div><div className="summary-row total"><span>Total</span><span>₹{subtotal.toLocaleString('en-IN')}</span></div><button type="button" className="primary-cta checkout-button">Proceed to checkout</button></aside></section>}</main></Page>;
}

function About({ bagCount }) {
  return <Page active="about" bagCount={bagCount}><main><section className="about-intro"><span className="eyebrow">About KishabySree · കൊച്ചി</span><h1>Clothing<br />with <em>clarity.</em></h1><p>We make fewer, better things for a life in motion. A wardrobe with space to breathe.</p><span className="about-mark">Theyyam<br />2018<br /><b>KOCHI</b></span></section><div className="about-image"><img src={heroImage} alt="Woman in a handwoven Kerala saree" /><span className="image-caption">Saree study / Kasavu, cotton, light</span></div><section className="about-grid"><h2>A practice in restraint.</h2><div><p>KishabySree is an independent clothing studio rooted in Kochi. Our point of view comes from Kerala's coast: generous, tactile, and attuned to the weather.</p><p>We work with small weaving communities, natural fibers, and the patient pace of handwork. The drama belongs to the cloth: a kasavu border, a Theyyam red, a Kathakali green.</p><a className="about-social" href={instagramUrl} target="_blank" rel="noreferrer">Follow the studio journal on Instagram <ArrowIcon /></a><div className="quote"><span className="eyebrow">A note from the studio</span><p>“Good clothes do not ask for attention. They give it back to you.”</p></div></div></section></main></Page>;
}

function Journal({ bagCount }) {
  const products = useContext(CatalogContext);
  const stories = [
    { label: '01 / Craft', title: 'The gold edge of Kerala', copy: 'A closer look at the kasavu border and the patient hands behind it.', image: products[0].images[1] },
    { label: '02 / Ritual', title: 'Dressing for the in-between', copy: 'On everyday ceremony, monsoon light, and finding your own drape.', image: products[1].images[1] },
    { label: '03 / Place', title: 'Notes from Kannur', copy: 'Colour, rhythm, and the vivid visual language of Theyyam.', image: products[2].images[0] }
  ];
  return <Page active="journal" bagCount={bagCount}><main className="journal-page"><section className="page-intro"><span className="eyebrow">The journal · Kerala</span><h1>Notes from<br /><em>the coast.</em></h1></section><section className="journal-grid">{stories.map(story => <article className="journal-card" key={story.title}><img src={story.image} alt={story.title} /><div className="journal-card-copy"><span className="eyebrow">{story.label}</span><h2>{story.title}</h2><p>{story.copy}</p><a className="text-link" href="#/about">Read story <ArrowIcon /></a></div></article>)}</section></main></Page>;
}

function Page({ active, bagCount, children }) {
  return <div className="page"><Header active={active} bagCount={bagCount} />{children}<Footer /></div>;
}

function LittleSree({ isBagPage, isHomePage }) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [messages, setMessages] = useState([{ role: 'assistant', content: "Namaskaram! I'm Little Sree, the KishabySree site guide. Ask me about our clothing, categories, materials, prices, or details published here." }]);
  const messagesRef = useRef(null);

  useEffect(() => {
    if (isOpen && messagesRef.current) messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
  }, [isOpen, messages, isSending]);

  async function sendMessage(event) {
    event.preventDefault();
    const content = input.trim();
    if (!content || isSending) return;

    const nextMessages = [...messages, { role: 'user', content }];
    setMessages(nextMessages);
    setInput('');
    setIsSending(true);
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ messages: nextMessages })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Little Sree could not reply. Please try again.');
      setMessages([...nextMessages, { role: 'assistant', content: result.reply }]);
    } catch (error) {
      setMessages([...nextMessages, { role: 'assistant', content: error.message || 'Little Sree could not reply. Please try again.' }]);
    } finally {
      setIsSending(false);
    }
  }

  return <div className={`little-sree-widget ${isBagPage ? 'on-bag-page' : ''} ${isHomePage ? 'on-home-page' : ''}`}>
    {isOpen && <section className="little-sree-panel" id="little-sree-panel" role="dialog" aria-modal="false" aria-labelledby="little-sree-title">
      <header className="little-sree-header">
        <span className="little-sree-mark" aria-hidden="true">LS</span>
        <div><h2 id="little-sree-title">Little Sree</h2><span>Your KishabySree guide</span></div>
        <button className="little-sree-close" type="button" aria-label="Close Little Sree chat" onClick={() => setIsOpen(false)}>×</button>
      </header>
      <div className="little-sree-messages" ref={messagesRef} role="log" aria-live="polite" aria-relevant="additions text">
        {messages.map((message, index) => <p className={`little-sree-message ${message.role}`} key={`${index}-${message.role}`}>{message.content}</p>)}
        {isSending && <p className="little-sree-message assistant typing" aria-label="Little Sree is typing">Little Sree is thinking...</p>}
      </div>
      <form className="little-sree-form" onSubmit={sendMessage}>
        <input value={input} onChange={event => setInput(event.target.value)} placeholder="Ask about KishabySree..." aria-label="Message Little Sree" maxLength={1000} disabled={isSending} />
        <button type="submit" aria-label="Send message" disabled={!input.trim() || isSending}>Send</button>
      </form>
      <span className="little-sree-note">AI guide · KishabySree topics only</span>
    </section>}
    {!isOpen && <button className="little-sree-launcher" type="button" aria-label="Open Little Sree chat" aria-expanded={false} aria-controls="little-sree-panel" onClick={() => setIsOpen(true)}>
      <Suspense fallback={<span className="kathakali-loading" aria-hidden="true" />}>
        <KathakaliMiniature />
      </Suspense>
      <span className="little-sree-launcher-copy">
        <strong>Little Sree</strong>
        <small>Ask about saree stories</small>
      </span>
    </button>}
  </div>;
}

function App() {
  const [bagItems, setBagItems] = useState([]);
  const [route, setRoute] = useState(window.location.hash);
  const [catalog, setCatalog] = useState(localProducts);
  const [catalogError, setCatalogError] = useState('');
  const bagCount = bagItems.reduce((sum, item) => sum + item.quantity, 0);

  function addToBag(product, size) {
    setBagItems(current => addBagItem(current, product, size));
  }

  useEffect(() => { const updateRoute = () => setRoute(window.location.hash); window.addEventListener('hashchange', updateRoute); return () => window.removeEventListener('hashchange', updateRoute); }, []);
  useEffect(() => { window.scrollTo(0, 0); }, [route]);
  useEffect(() => {
    let active = true;
    fetchProducts().then(result => {
      if (active) setCatalog(result);
    }).catch(error => {
      console.error('Could not load the Firebase product catalog:', error);
      if (active) {
        setCatalog(localProducts);
        setCatalogError('The live product catalog is unavailable. Showing preview products.');
      }
    });
    return () => { active = false; };
  }, []);
  const [path, query] = route.replace(/^#\/?/, '').split('?', 2);
  const parts = path.split('/').filter(Boolean);
  const initialGarment = new URLSearchParams(query).get('garment') || '';
  const product = catalog.find(item => item.id === parts[1]) || catalog[0];
  return <CatalogContext.Provider value={catalog}>
    {catalogError && <div className="catalog-error" role="alert">{catalogError}</div>}
    {parts[0] === 'about' && <About bagCount={bagCount} />}
    {parts[0] === 'journal' && <Journal bagCount={bagCount} />}
    {parts[0] === 'shop' && <Shop bagCount={bagCount} initialGarment={initialGarment} />}
    {parts[0] === 'bag' && <BagPage bagItems={bagItems} bagCount={bagCount} onClear={() => setBagItems([])} onRemoveItem={(id, size) => setBagItems(current => removeBagItem(current, id, size))} onChangeQuantity={(id, size, change) => setBagItems(current => changeBagQuantity(current, id, size, change))} />}
    {parts[0] === 'product' && parts[2] && <Description product={product} bagCount={bagCount} />}
    {parts[0] === 'product' && !parts[2] && <ProductDetail key={product.id} product={product} bagCount={bagCount} onAdd={size => addToBag(product, size)} />}
    {!parts[0] && <Home bagCount={bagCount} />}
    <LittleSree isBagPage={parts[0] === 'bag'} isHomePage={!parts[0]} />
  </CatalogContext.Provider>;
}

export default App;
