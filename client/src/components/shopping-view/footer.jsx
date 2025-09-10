import { Link } from "react-router-dom";

function ShoppingFooter() {
  return (
    <footer className="bg-gray-900 text-white py-8 mt-12">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h3 className="text-lg font-bold mb-4">Ecommerce</h3>
          <p className="text-sm">
            Your one-stop shop for the latest men&apos;s fashion. Quality products,
            great prices, and fast shipping.
          </p>
        </div>
        <div>
          <h3 className="text-lg font-bold mb-4">Quick Links</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <Link to="/shop/home" className="hover:underline">
                Home
              </Link>
            </li>
            <li>
              <Link to="/shop/listing" className="hover:underline">
                All Products
              </Link>
            </li>
            <li>
              <Link to="/shop/account" className="hover:underline">
                Account
              </Link>
            </li>
            <li>
              <Link to="/shop/search" className="hover:underline">
                Search
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="text-lg font-bold mb-4">Contact Us</h3>
          <p className="text-sm">Email: support@ecommerce.com</p>
          <p className="text-sm">Phone: +1 (555) 123-4567</p>
          <p className="text-sm">Address: 123 Fashion St, Style City</p>
        </div>
      </div>
      <div className="text-center text-xs mt-8">
        &copy; {new Date().getFullYear()} Ecommerce. All rights reserved.
      </div>
    </footer>
  );
}

export default ShoppingFooter;
