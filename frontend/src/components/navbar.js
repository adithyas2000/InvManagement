import Nav from 'react-bootstrap/Nav';
import { Outlet,useLocation } from 'react-router-dom';

const NavStrip = (props) => {
    const location = useLocation();
    console.log(location.pathname.split('/')[1]);
    if (location.pathname === '/') {
        window.location.href='/categories';
    } else {
        return (
            <div className=''>
                <Nav activeKey={location.pathname.split('/')[1]} variant="pills">
                    <Nav.Item >
                        <Nav.Link href="/categories" eventKey="categories">Categories</Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link href='/addProduct' eventKey="addProduct">Add Product</Nav.Link>
                    </Nav.Item>
                </Nav>
                <Outlet />
            </div>
        );
    }

}

export default NavStrip;