import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
// Removed Sheet imports as they cause context errors inside DropdownMenu
// import { SheetContent, SheetHeader, SheetTitle } from "../ui/sheet";
import UserCartItemsContent from "./cart-items-content";

function UserCartWrapper({ cartItems, setOpenCartSheet }) {
  const navigate = useNavigate();

  const totalCartAmount =
    cartItems && cartItems.length > 0
      ? cartItems.reduce(
          (sum, currentItem) =>
            sum +
            (currentItem?.salePrice > 0
              ? currentItem?.salePrice
              : currentItem?.price) *
              currentItem?.quantity,
          0
        )
      : 0;

  return (
    <div className="sm:max-w-md p-4">
      <div className="text-lg font-semibold border-b pb-2">Your Cart</div>
      <div className="mt-4 space-y-4">
        {cartItems && cartItems.length > 0
          ? cartItems.map((item, index) => (
              <UserCartItemsContent key={item._id || index} cartItem={item} />
            ))
          : null}
      </div>
      <div className="mt-4 space-y-4">
        <div className="flex justify-between font-bold">
          <span>Total</span>
          <span>₹{totalCartAmount}</span>
        </div>
      </div>
      <Button
        onClick={() => {
          navigate("/shop/checkout");
          setOpenCartSheet(false);
        }}
        className="w-full mt-6"
      >
        Checkout
      </Button>
    </div>
  );
}

export default UserCartWrapper;
