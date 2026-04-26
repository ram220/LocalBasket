import {Link} from 'react-router-dom';
import '../../pages/userPages/Home.css';

function Footer(){
    return(
        <div className="bg-white mt-5 py-5 border-top">
            <div className="container">
                <div className="row g-4 text-center text-md-start">
                    <div className="col-md-6">
                        <div className="d-flex align-items-center justify-content-center justify-content-md-start mb-3">
                            <img width="50" height="50" src="/localbasket-logo.png" alt='logo'/>
                            <span className="ms-2 fw-bold h4 mb-0" style={{ color: 'var(--primary-color)' }}>LocalBasket</span>
                        </div>
                        <p className="text-muted pe-md-5">
                            Fresh, organic, and locally sourced – we bring the best groceries straight to your doorstep.
                            Quality you can trust, every single day.
                        </p>
                        <p className="mt-3 text-muted small">© 2025 LocalBasket. All rights reserved.</p>
                    </div>
                    
                    <div className="col-md-3">
                        <h5 className="fw-bold mb-3">Quick Links</h5>
                        <ul className='list-unstyled'>
                            <li className='mb-2'><Link className='text-decoration-none text-muted' to="/">Home</Link></li>
                            <li className="mb-2"><Link className='text-decoration-none text-muted' to="/products">Products</Link></li>
                            <li className="mb-2"><Link className='text-decoration-none text-muted' to="/login">Login</Link></li>
                            <li className="mb-2"><Link className='text-decoration-none text-muted' to="/cart">Cart</Link></li>
                        </ul>
                    </div>
                    <div className="col-md-3">
                        <h5 className="fw-bold mb-3">Follow Us</h5>
                        <div className="d-flex gap-3 justify-content-center justify-content-md-start">
                            <Link className='text-muted' to="https://www.instagram.com/_itzz_ram_22/#">Instagram</Link>
                            <Link className='text-muted' to="https://www.linkedin.com/in/ramakrishna-valluru-90b733252/">LinkedIn</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
export default Footer;