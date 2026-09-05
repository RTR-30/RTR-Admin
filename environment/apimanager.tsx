// const baseUri = "http://10.0.2.2:8000/";
const baseUri = "http://10.109.252.206:8000/";

const base = "admin/";
const paymentBase = "payment/";
const feedbackBase = "feedback/";

export const Auth = {
    login : `${baseUri}${base}auth/login`
}

export const approvalsubmitend = "/verify";

export const totalcarownerapi = `${baseUri}${base}users`;
export const totalcardriverapi = `${baseUri}${base}partners`;
export const totalbookinglistapi = `${baseUri}${base}bookings`;
export const totalapprovedapi = `${baseUri}${base}partner-verifications`;
export const submitapprovalapi = `${baseUri}${base}partners/`;

export const createTripTypeApi = `${baseUri}${paymentBase}/create-trip-type`;

export const getTripTypeApi = `${baseUri}${paymentBase}trip-types`;
export const createPaymentApi = `${baseUri}${paymentBase}create-trip-payment`;
export const getTripPaymentApi = `${baseUri}${paymentBase}trip-payments?tripTypeId=`;
export const UpdateTripPaymentApi = `${baseUri}${paymentBase}trip-payment/`;
export const WithdrawRequestApi = `${baseUri}${base}withdrawals?status=PENDING`;
export const ApprovalApis = `${baseUri}${base}withdrawal/approve`;
export const RejectApis = `${baseUri}${base}withdrawal/reject`;

export const AppsettingsApi = `${baseUri}${base}settings`;
export const PackageApi = `${baseUri}${base}packages`;
export const GearTypeApis = `${baseUri}${base}gear-types`;

export const FeedbackApis = `${baseUri}${feedbackBase}tags`;

