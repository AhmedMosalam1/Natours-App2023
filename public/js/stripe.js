import axios from 'axios';
import { showAlert } from './alerts';

export const bookTour = async tourId => {
  try {
    const stripe = Stripe(
      'pk_test_51NopXFLGYQE1Xj53peJplXUPtrFVpzuVr7GUSLRxcK4ckjq00wODuscvrl78afof8Gk3jWALTeUYFaflvHSwiuow00PZ5lpHcA'
    );

    // Get checkout session from API
    const session = await axios(`/api/booking/checkout-session/${tourId}`);
    
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id
    });
    //console.log(session)
  } catch (err) {
    console.log(err);
    showAlert('error', err);
  }
};