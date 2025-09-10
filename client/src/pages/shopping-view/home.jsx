import { Button } from "@/components/ui/button";
import bannerOne from "../../assets/banner-1.webp";
import bannerTwo from "../../assets/banner-2.jpg";
import bannerThree from "../../assets/banner-3.jpg";
import { ChevronLeftIcon, ChevronRightIcon, ShirtIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAllFilteredProducts,
  fetchProductDetails,
} from "@/store/shop/products-slice";
import ShoppingProductTile from "@/components/shopping-view/product-tile";
import { useNavigate } from "react-router-dom";
import { addToCart, fetchCartItems } from "@/store/shop/cart-slice";
import { useToast } from "@/components/ui/use-toast";
import ProductDetailsDialog from "@/components/shopping-view/product-details";
import { getFeatureImages } from "@/store/common-slice";
import ShoppingFooter from "@/components/shopping-view/footer";

const brandsWithIcon = [
  { id: "nike", label: "Nike", icon: ShirtIcon },
  { id: "adidas", label: "Adidas", icon: ShirtIcon },
  { id: "puma", label: "Puma", icon: ShirtIcon },
  { id: "levi", label: "Levi's", icon: ShirtIcon },
  { id: "zara", label: "Zara", icon: ShirtIcon },
  { id: "h&m", label: "H&M", icon: ShirtIcon },
];

function ShoppingHome() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { productList, productDetails } = useSelector(
    (state) => state.shopProducts
  );

  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);

  const { user } = useSelector((state) => state.auth);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();

  const banners = [bannerOne, bannerTwo, bannerThree];

  function handleNavigateToListingPage(getCurrentItem, section) {
    sessionStorage.removeItem("filters");
    const currentFilter = {
      [section]: [getCurrentItem.id],
    };

    sessionStorage.setItem("filters", JSON.stringify(currentFilter));
    navigate(`/shop/listing`);
  }

  function handleGetProductDetails(getCurrentProductId) {
    dispatch(fetchProductDetails(getCurrentProductId));
  }

  function handleAddtoCart(getCurrentProductId) {
    dispatch(
      addToCart({
        userId: user?.id,
        productId: getCurrentProductId,
        quantity: 1,
      })
    ).then((data) => {
      if (data?.payload?.success) {
        dispatch(fetchCartItems(user?.id));
        toast({
          title: "Product is added to cart",
        });
      }
    });
  }

  useEffect(() => {
    if (productDetails !== null) setOpenDetailsDialog(true);
  }, [productDetails]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prevSlide) => (prevSlide + 1) % banners.length);
    }, 15000);

    return () => clearInterval(timer);
  }, [banners.length]);

  // Fetch only men's products
  useEffect(() => {
    dispatch(
      fetchAllFilteredProducts({
        filterParams: { category: ["men-shirts", "men-pants", "men-jackets", "men-shoes"] },
        sortParams: "price-lowtohigh",
      })
    );
  }, [dispatch]);

  useEffect(() => {
    dispatch(getFeatureImages());
  }, [dispatch]);

  return (
    <div className="flex flex-col min-h-screen">
      <div className="relative w-full h-[400px] md:h-[600px] overflow-hidden group">
        {banners.map((slide, index) => (
          <img
            src={slide}
            key={index}
            className={`${
              index === currentSlide
                ? "translate-x-0 opacity-100 scale-100"
                : index < currentSlide
                ? "-translate-x-full opacity-0 scale-95"
                : "translate-x-full opacity-0 scale-95"
            } absolute top-0 left-0 w-full h-full object-cover transition-all duration-1000 ease-in-out transform hover:scale-105`}
            alt="Men's Wear Banner"
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <Button
          variant="outline"
          size="icon"
          onClick={() =>
            setCurrentSlide(
              (prevSlide) =>
                (prevSlide - 1 + banners.length) %
                banners.length
            )
          }
          className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white border-white/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        >
          <ChevronLeftIcon className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() =>
            setCurrentSlide(
              (prevSlide) => (prevSlide + 1) % banners.length
            )
          }
          className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white border-white/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        >
          <ChevronRightIcon className="w-4 h-4" />
        </Button>
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? "bg-white scale-125"
                  : "bg-white/50 hover:bg-white/75"
              }`}
            />
          ))}
        </div>
      </div>

      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">Shop by Brand</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {brandsWithIcon.map((brandItem) => (
              <Card
                key={brandItem.id}
                onClick={() => handleNavigateToListingPage(brandItem, "brand")}
                className="cursor-pointer hover:shadow-lg transition-shadow"
              >
                <CardContent className="flex flex-col items-center justify-center p-6">
                  <brandItem.icon className="w-12 h-12 mb-4 text-primary" />
                  <span className="font-bold">{brandItem.label}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">New Arrivals</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {productList && productList.length > 0
              ? productList.slice(0, 8).map((productItem) => (
                  <ShoppingProductTile
                    key={productItem._id}
                    handleGetProductDetails={handleGetProductDetails}
                    product={productItem}
                    handleAddtoCart={handleAddtoCart}
                  />
                ))
            : <p className="col-span-full text-center">No new arrivals found.</p>}
          </div>
        </div>
      </section>

      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">Best Sellers</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {productList && productList.length > 0
              ? productList.slice(4, 12).map((productItem) => (
                  <ShoppingProductTile
                    key={productItem._id}
                    handleGetProductDetails={handleGetProductDetails}
                    product={productItem}
                    handleAddtoCart={handleAddtoCart}
                  />
                ))
            : <p className="col-span-full text-center">No best sellers found.</p>}
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">What Our Customers Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="animate-fadeInUp">
              <CardContent className="p-6">
                <p className="text-gray-600 mb-4">
                  &ldquo;Amazing quality and fast shipping. Highly recommend!&rdquo;
                </p>
                <div className="flex items-center">
                  <img
                    src="/src/assets/account.jpg"
                    alt="John Doe"
                    className="w-10 h-10 rounded-full mr-4 object-cover"
                  />
                  <div>
                    <p className="font-bold">John Doe</p>
                    <p className="text-sm text-gray-500">Verified Customer</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="animate-fadeInUp delay-150">
              <CardContent className="p-6">
              <p className="text-gray-600 mb-4">
                &ldquo;Great selection of men&apos;s fashion. Love the styles!&rdquo;
              </p>
                <div className="flex items-center">
                  <img
                    src="/src/assets/account.jpg"
                    alt="Jane Smith"
                    className="w-10 h-10 rounded-full mr-4 object-cover"
                  />
                  <div>
                    <p className="font-bold">Jane Smith</p>
                    <p className="text-sm text-gray-500">Verified Customer</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="animate-fadeInUp delay-300">
              <CardContent className="p-6">
                <p className="text-gray-600 mb-4">
                  &ldquo;Excellent customer service and affordable prices.&rdquo;
                </p>
                <div className="flex items-center">
                  <img
                    src="/src/assets/account.jpg"
                    alt="Mike Johnson"
                    className="w-10 h-10 rounded-full mr-4 object-cover"
                  />
                  <div>
                    <p className="font-bold">Mike Johnson</p>
                    <p className="text-sm text-gray-500">Verified Customer</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <ShoppingFooter />

      <ProductDetailsDialog
        open={openDetailsDialog}
        setOpen={setOpenDetailsDialog}
        productDetails={productDetails}
      />
    </div>
  );
}

export default ShoppingHome;
