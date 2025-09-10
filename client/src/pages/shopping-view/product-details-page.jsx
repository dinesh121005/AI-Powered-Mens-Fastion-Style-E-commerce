import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchProductDetails, fetchAllFilteredProducts } from "@/store/shop/products-slice";
import { addToCart, fetchCartItems } from "@/store/shop/cart-slice";
import { getReviews, addReview } from "@/store/shop/review-slice";
import { Button } from "@/components/ui/button";
import StarRatingComponent from "@/components/common/star-rating";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import ShoppingProductTile from "@/components/shopping-view/product-tile";

function ProductDetailsPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { productDetails } = useSelector((state) => state.shopProducts);
  const { cartItems } = useSelector((state) => state.shopCart);
  const { reviews } = useSelector((state) => state.shopReview);
  const { user } = useSelector((state) => state.auth);
  const { toast } = useToast();

  const [selectedImage, setSelectedImage] = useState(null);
  const [reviewMsg, setReviewMsg] = useState("");
  const [rating, setRating] = useState(0);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  useEffect(() => {
    dispatch(fetchProductDetails(id));
  }, [id, dispatch]);

  useEffect(() => {
    if (productDetails) {
      setSelectedImage(productDetails.image);
      dispatch(getReviews(productDetails._id));

      // Fetch related products by brand and category
      dispatch(
        fetchAllFilteredProducts({
          filterParams: {
            brand: productDetails.brand,
            category: productDetails.category,
          },
          sortParams: "price-lowtohigh",
        })
      ).then((res) => {
        if (res.payload && res.payload.data) {
          // Exclude current product from related products
          const filtered = res.payload.data.filter(
            (prod) => prod._id !== productDetails._id
          );
          setRelatedProducts(filtered);
        }
      });
    }
  }, [productDetails, dispatch]);

  function handleAddToCart() {
    if (!productDetails) return;

    let getCartItems = cartItems.items || [];

    if (getCartItems.length) {
      const indexOfCurrentItem = getCartItems.findIndex(
        (item) => item.productId === productDetails._id
      );
      if (indexOfCurrentItem > -1) {
        const getQuantity = getCartItems[indexOfCurrentItem].quantity;
        if (getQuantity + 1 > productDetails.totalStock) {
          toast({
            title: `Only ${getQuantity} quantity can be added for this item`,
            variant: "destructive",
          });
          return;
        }
      }
    }
    dispatch(
      addToCart({
        userId: user?.id,
        productId: productDetails._id,
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

  function handleRatingChange(getRating) {
    setRating(getRating);
  }

  function handleAddReview() {
    if (!productDetails || isSubmittingReview) return;

    setIsSubmittingReview(true);

    dispatch(
      addReview({
        productId: productDetails._id,
        userId: user?.id,
        userName: user?.userName,
        reviewMessage: reviewMsg,
        reviewValue: rating,
      })
    ).then((data) => {
      if (data.payload.success) {
        setRating(0);
        setReviewMsg("");
        dispatch(getReviews(productDetails._id));
        toast({
          title: "Review added successfully!",
        });
      }
    }).finally(() => {
      setIsSubmittingReview(false);
    });
  }

  const averageReview =
    reviews && reviews.length > 0
      ? reviews.reduce((sum, reviewItem) => sum + reviewItem.reviewValue, 0) /
        reviews.length
      : 0;

  if (!productDetails) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto p-6 grid grid-cols-1 md:grid-cols-3 gap-10">
      {/* Images Section */}
      <div className="col-span-1">
        <img
          src={selectedImage || productDetails?.image}
          alt={productDetails?.title}
          className="w-full rounded-lg object-cover"
          style={{ aspectRatio: "1 / 1" }}
        />
        <div className="flex gap-4 mt-4 overflow-x-auto">
          {[productDetails?.image, ...(productDetails?.additionalImages || [])].map(
            (img, idx) =>
              img && (
                <img
                  key={idx}
                  src={img}
                  alt={`Thumbnail ${idx}`}
                  className={`w-20 h-20 rounded-lg cursor-pointer object-cover border-2 ${
                    selectedImage === img ? "border-primary" : "border-transparent"
                  }`}
                  onClick={() => setSelectedImage(img)}
                />
              )
          )}
        </div>
      </div>

      {/* Product Info Section */}
      <div className="col-span-2 flex flex-col">
        <h1 className="text-4xl font-extrabold mb-4">{productDetails?.title}</h1>
        <div className="flex items-center gap-4 mb-4">
          <StarRatingComponent rating={averageReview} />
          <span className="text-muted-foreground">({averageReview.toFixed(2)})</span>
        </div>
        <p className="text-2xl font-semibold text-primary mb-4">
        ₹{productDetails?.salePrice > 0 ? productDetails.salePrice : productDetails?.price}
        {productDetails?.salePrice > 0 && (
          <span className="line-through text-muted-foreground ml-2">
            ₹{productDetails?.price}
          </span>
        )}
        </p>
        <p className="mb-6">{productDetails?.description}</p>

        {/* Options placeholder (size, color) */}
        {/* Add your options UI here if applicable */}

        <Button
          className={`w-48 mb-6 ${
            productDetails?.totalStock === 0 ? "opacity-60 cursor-not-allowed" : ""
          }`}
          disabled={productDetails?.totalStock === 0}
          onClick={handleAddToCart}
        >
          {productDetails?.totalStock === 0 ? "Out of Stock" : "Add to Cart"}
        </Button>

        <Separator />

        {/* Reviews Section */}
        <div className="mt-6">
          <h2 className="text-3xl font-bold mb-6 flex items-center justify-between">
            Reviews
            <span className="text-sm text-muted-foreground">
              {reviews ? reviews.length : 0} review{reviews && reviews.length !== 1 ? "s" : ""}
            </span>
          </h2>

          {reviews && reviews.length > 0 ? (
            <div className="space-y-6 mb-8">
              {reviews.map((reviewItem) => (
                <div
                  key={reviewItem._id}
                  className="p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 flex gap-4"
                  role="article"
                  aria-label={`Review by ${reviewItem.userName}`}
                >
                  <Avatar className="w-12 h-12 border flex-shrink-0">
                    <AvatarFallback>{reviewItem?.userName[0].toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col flex-grow">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-lg">{reviewItem?.userName}</h3>
                      {/* Assuming reviewItem has a date field */}
                      {reviewItem.date && (
                        <time
                          dateTime={new Date(reviewItem.date).toISOString()}
                          className="text-xs text-muted-foreground"
                        >
                          {new Date(reviewItem.date).toLocaleDateString()}
                        </time>
                      )}
                    </div>
                    <StarRatingComponent rating={reviewItem?.reviewValue} />
                    <p className="mt-2 text-muted-foreground">{reviewItem.reviewMessage}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground italic">No reviews yet. Be the first to review!</p>
          )}

          {/* Add Review */}
          <div className="border-t pt-6">
            <Label htmlFor="reviewMsg" className="mb-2 block font-semibold">
              Write a review
            </Label>
            <StarRatingComponent rating={rating} handleRatingChange={handleRatingChange} />
            <Input
              id="reviewMsg"
              name="reviewMsg"
              value={reviewMsg}
              onChange={(e) => setReviewMsg(e.target.value)}
              placeholder="Write a review..."
              className="mt-2 mb-4"
              aria-required="true"
              aria-describedby="reviewHelp"
            />
            <Button
              onClick={handleAddReview}
              disabled={reviewMsg.trim() === ""}
              aria-disabled={reviewMsg.trim() === ""}
              aria-live="polite"
            >
              Submit
            </Button>
          </div>
        </div>
      </div>

      {/* Related Products Section */}
      <div className="col-span-3 mt-10">
        <h2 className="text-2xl font-bold mb-6">You might also like</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {relatedProducts.length > 0 ? (
            relatedProducts.map((relatedProduct) => (
              <ShoppingProductTile
                key={relatedProduct._id}
                product={relatedProduct}
                handleAddtoCart={(productId, totalStock) => {
                  // Check stock before adding
                  const cartItem = cartItems.items?.find(
                    (item) => item.productId === productId
                  );
                  const currentQuantity = cartItem ? cartItem.quantity : 0;
                  if (currentQuantity + 1 > totalStock) {
                    toast({
                      title: `Only ${currentQuantity} quantity can be added for this item`,
                      variant: "destructive",
                    });
                    return;
                  }
                  dispatch(
                    addToCart({
                      userId: user?.id,
                      productId,
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
                }}
              />
            ))
          ) : (
            <p>No related products found.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductDetailsPage;
