import axios from "axios";
import { showAlert } from "./alert";

export const bookTour = async (tourId) => {
  try {
    const stripe = Stripe(
      "pk_test_51QLMPeGLJVNVtyBYiTd4czIFOXyPPPOpS0iOjBlJzI5hFAYPPC7txjwpq5LpGnz4R2ENQceWHSV2yPpYHJrTrjBB002YogaQyl"
    );
    // 1) Get checkout session from API
    const session = await axios(
      `http://localhost:3000/api/v1/bookings/checkout-session/${tourId}`
    );
    console.log(session, session.data.session.id);

    // 2) Create checkout form + chanre credit card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
    // window.location.replace(session.data.session.url);
  } catch (err) {
    showAlert("error", err);
  }
};
