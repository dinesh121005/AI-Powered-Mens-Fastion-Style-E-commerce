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

  const [selectedImage, setSelectedImage] = useState(null); // product image display
  const [reviewMsg, setReviewMsg] = useState("");
  const [rating, setRating] = useState(0);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [uploadedUserImage, setUploadedUserImage] = useState(null); // user upload image
  const [tryOnResult, setTryOnResult] = useState(null); // image result from try-on
  const [isTryingOn, setIsTryingOn] = useState(false);

  // Fetch product details
  useEffect(() => {
    dispatch(fetchProductDetails(id));
  }, [id, dispatch]);

  // When product details load
  useEffect(() => {
    if (productDetails) {
      setSelectedImage(productDetails.image);
      dispatch(getReviews(productDetails._id));

      // Related products
      dispatch(
        fetchAllFilteredProducts({
          filterParams: {
            brand: productDetails.brand,
            category: productDetails.category,
          },
          sortParams: "price-lowtohigh",
        })
      ).then((res) => {
        if (res?.payload?.data) {
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

    const items = cartItems.items || [];
    const found = items.find((item) => item.productId === productDetails._id);
    if (found && found.quantity + 1 > productDetails.totalStock) {
      toast({
        title: `Only ${found.quantity} quantity can be added for this item`,
        variant: "destructive",
      });
      return;
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
        toast({ title: "Product added to cart" });
      }
    });
  }

  function handleRatingChange(getRating) {
    setRating(getRating);
  }

  function handleReviewImageUpload(e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setUploadedUserImage(reader.result); // this is base64 data URI
      };
      reader.onerror = () => {
        console.error("Error reading user image");
      };
      reader.readAsDataURL(file);
    }
  }

  function handleAddReview() {
    if (!productDetails || isSubmittingReview) return;
    if (!user?.id) {
      toast({ title: "Please login to submit a review", variant: "destructive" });
      return;
    }

    setIsSubmittingReview(true);

    dispatch(
      addReview({
        productId: productDetails._id,
        userId: user.id,
        userName: user.userName,
        reviewMessage: reviewMsg,
        reviewValue: rating,
        reviewImage: uploadedUserImage, // send base64 possibly
      })
    )
      .then((data) => {
        if (data.payload?.success) {
          setRating(0);
          setReviewMsg("");
          setUploadedUserImage(null);
          dispatch(getReviews(productDetails._id));
          toast({ title: "Review added successfully!" });
        }
      })
      .catch((error) => {
        toast({
          title: error?.response?.data?.message || "Failed to add review",
          variant: "destructive",
        });
      })
      .finally(() => setIsSubmittingReview(false));
  }

  // ========== New: Try-On via Hugging Face ==========
  async function handleTryOnWithHF() {
    if (!uploadedUserImage) {
      toast({ title: "Please upload your image first", variant: "destructive" });
      return;
    }
    if (!selectedImage) {
      toast({ title: "Product image not loaded yet", variant: "destructive" });
      return;
    }

    setIsTryingOn(true);

    try {
      const response = await fetch("http://localhost:5000/api/ai/tryon", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          personImage: uploadedUserImage,   // base64 data URI
          garmentImage: selectedImage,     // you might want to convert product selectedImage to base64 or have your backend accept URLs
          seed: Math.floor(Math.random() * 1000000),
        }),
      });

      const resultData = await response.json();

      if (response.ok && resultData?.resultImageBase64) {
        // Assuming your backend returns something like { resultImageBase64: "iVBORw0..." }
        setTryOnResult(`data:image/png;base64,${resultData.resultImageBase64}`);
      } else {
        toast({ title: "Try-On failed, please try again", variant: "destructive" });
        console.error("HF Try-On error", resultData);
      }
    } catch (err) {
      console.error("Error calling Try-On API", err);
      toast({ title: "Error connecting to Try-On API", variant: "destructive" });
    } finally {
      setIsTryingOn(false);
    }
  }

  const averageReview =
    reviews && reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.reviewValue, 0) / reviews.length
      : 0;

  if (!productDetails) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto p-6 grid grid-cols-1 md:grid-cols-3 gap-10">
      {/* Left / Images Section */}
      <div className="col-span-1">
        {/* Main product image/public view */}
        <img
          src={selectedImage || productDetails.image}
          alt={productDetails?.title}
          className="w-full rounded-lg object-cover"
          style={{ aspectRatio: "1 / 1" }}
        />
        <div className="flex gap-4 mt-4 overflow-x-auto">
          {[productDetails.image, ...(productDetails.additionalImages || [])].map(
            (img, idx) =>
              img && (
                <img
                  key={idx}
                  src={img}
                  alt={`Thumbnail ${idx}`}
                  className={`w-20 h-20 rounded-lg cursor-pointer object-cover border-2 ${
                    selectedImage === img ? "border-primary" : "border-transparent"
                  }`}
                  onClick={() => {
                    setSelectedImage(img);
                    setTryOnResult(null); // reset try-on result if product changed
                  }}
                />
              )
          )}
        </div>

        {/* Try-On Section */}
        <div className="mt-6">
          <Label className="block font-semibold mb-2">Upload Your Photo for Try-On</Label>
          <Input type="file" accept="image/*" onChange={handleReviewImageUpload} />
          {uploadedUserImage && (
            <div className="mt-4">
              <p className="mb-2">Your Uploaded Image:</p>
              <img
                src={uploadedUserImage}
                alt="uploaded user"
                className="w-full rounded-lg object-cover"
                style={{ maxHeight: 400 }}
              />
            </div>
          )}

          <Button
            className="mt-4"
            onClick={handleTryOnWithHF}
            disabled={isTryingOn}
          >
            {isTryingOn ? "Trying..." : "Try-On Virtual"}
          </Button>

          {tryOnResult && (
            <div className="mt-6">
              <p className="mb-2">Try-On Result:</p>
              <img
                src={tryOnResult}
                alt="try-on result"
                className="w-full rounded-lg object-cover"
                style={{ maxHeight: 400 }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Right / Product Info Section */}
      <div className="col-span-2 flex flex-col">
        <h1 className="text-4xl font-extrabold mb-4">
          {productDetails?.title}
        </h1>
        <div className="flex items-center gap-4 mb-4">
          <StarRatingComponent rating={averageReview} />
          <span className="text-muted-foreground">
            ({averageReview.toFixed(2)})
          </span>
        </div>
        <p className="text-2xl font-semibold text-primary mb-4">
          ₹
          {productDetails?.salePrice > 0
            ? productDetails.salePrice
            : productDetails?.price}
          {productDetails?.salePrice > 0 && (
            <span className="line-through text-muted-foreground ml-2">
              ₹{productDetails?.price}
            </span>
          )}
        </p>
        <p className="mb-6">{productDetails?.description}</p>

        <Button
          className={`w-48 mb-6 ${
            productDetails.totalStock === 0 ? "opacity-60 cursor-not-allowed" : ""
          }`}
          disabled={productDetails.totalStock === 0}
          onClick={handleAddToCart}
        >
          {productDetails.totalStock === 0 ? "Out of Stock" : "Add to Cart"}
        </Button>

        <Separator />

        {/* Reviews Section */}
        <div className="mt-6">
          <h2 className="text-3xl font-bold mb-6 flex items-center justify-between">
            Reviews
            <span className="text-sm text-muted-foreground">
              {reviews ? reviews.length : 0} review
              {reviews && reviews.length !== 1 ? "s" : ""}
            </span>
          </h2>
          {reviews && reviews.length > 0 ? (
            <div className="space-y-6 mb-8">
              {reviews.map((rev) => (
                <div
                  key={rev._id}
                  className="p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 flex gap-4"
                  role="article"
                  aria-label={`Review by ${rev.userName}`}
                >
                  <Avatar className="w-12 h-12 border flex-shrink-0">
                    <AvatarFallback>
                      {rev.userName[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col flex-grow">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-lg">{rev.userName}</h3>
                      {rev.date && (
                        <time
                          dateTime={new Date(rev.date).toISOString()}
                          className="text-xs text-muted-foreground"
                        >
                          {new Date(rev.date).toLocaleDateString()}
                        </time>
                      )}
                    </div>
                    <StarRatingComponent rating={rev.reviewValue} />
                    <p className="mt-2 text-muted-foreground">{rev.reviewMessage}</p>
                    {rev.reviewImage && (
                      <img
                        src={rev.reviewImage}
                        alt="review pic"
                        className="mt-2 rounded-lg"
                        style={{ maxWidth: "200px", objectFit: "cover" }}
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground italic">
              No reviews yet. Be the first to review!
            </p>
          )}

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
              className="mt-2 mb-2"
              aria-required="true"
            />

            <div className="mb-4">
              <Label htmlFor="reviewImage" className="mb-1 block font-medium">
                Upload an image (optional)
              </Label>
              <Input
                type="file"
                id="reviewImage"
                accept="image/*"
                onChange={handleReviewImageUpload}
              />
              {uploadedUserImage && (
                <img
                  src={uploadedUserImage}
                  alt="uploaded preview"
                  className="w-32 h-32 object-cover mt-2 rounded border"
                />
              )}
            </div>

            <Button onClick={handleAddReview} disabled={reviewMsg.trim() === ""}>
              Submit Review
            </Button>
          </div>
        </div>
      </div>

      {/* Related Products Section */}
      <div className="col-span-3 mt-10">
        <h2 className="text-2xl font-bold mb-6">You might also like</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {relatedProducts.length ? (
            relatedProducts.map((relatedProduct) => (
              <ShoppingProductTile
                key={relatedProduct._id}
                product={relatedProduct}
                handleAddtoCart={(productId, totalStock) => {
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
                      toast({ title: "Product added to cart!" });
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
