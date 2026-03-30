// // services/receiptService.js
// // Generate and download ride receipts as PDF

// import * as Print from 'expo-print';
// import * as Sharing from 'expo-sharing';
// import { Alert, Platform } from 'react-native';

// /**
//  * Format a Firestore timestamp or Date into a readable string
//  */
// const formatDateTime = (timestamp) => {
//   if (!timestamp) return 'N/A';
//   const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
//   return date.toLocaleString('en-US', {
//     weekday: 'short',
//     year: 'numeric',
//     month: 'short',
//     day: 'numeric',
//     hour: '2-digit',
//     minute: '2-digit',
//   });
// };

// /**
//  * Format distance from meters
//  */
// const formatDistance = (meters) => {
//   if (!meters) return '0 km';
//   if (meters < 1000) return `${Math.round(meters)} m`;
//   return `${(meters / 1000).toFixed(1)} km`;
// };

// /**
//  * Format duration from seconds
//  */
// const formatDuration = (seconds) => {
//   if (!seconds) return '0 min';
//   const mins = Math.floor(seconds / 60);
//   return `${mins} min`;
// };

// /**
//  * Build the HTML template for the receipt
//  */
// const buildReceiptHTML = (ride) => {
//   const studentName =
//     [ride.studentInfo?.firstName, ride.studentInfo?.lastName]
//       .filter(Boolean)
//       .join(' ') || 'Student';

//   const driverName =
//     [ride.driverInfo?.firstName, ride.driverInfo?.lastName]
//       .filter(Boolean)
//       .join(' ') || 'Driver';

//   const rideDate = formatDateTime(ride.completedAt || ride.createdAt);
//   const receiptId = ride.id ? ride.id.slice(0, 8).toUpperCase() : 'N/A';
//   const isCompleted = ride.status === 'completed';

//   return `
//     <!DOCTYPE html>
//     <html lang="en">
//     <head>
//       <meta charset="UTF-8" />
//       <meta name="viewport" content="width=device-width, initial-scale=1.0" />
//       <style>
//         * { margin: 0; padding: 0; box-sizing: border-box; }

//         body {
//           font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
//           background: #f5f5f5;
//           padding: 40px 20px;
//           color: #1a1a1a;
//         }

//         .receipt {
//           max-width: 420px;
//           margin: 0 auto;
//           background: #ffffff;
//           border-radius: 20px;
//           overflow: hidden;
//           box-shadow: 0 4px 24px rgba(0,0,0,0.08);
//         }

//         /* ── Header ── */
//         .header {
//           background: #1a1a1a;
//           padding: 32px 28px 24px;
//           text-align: center;
//         }

//         .brand {
//           font-size: 26px;
//           font-weight: 800;
//           color: #fedc33;
//           letter-spacing: -0.5px;
//           margin-bottom: 4px;
//         }

//         .brand span {
//           color: #ffffff;
//         }

//         .receipt-label {
//           font-size: 12px;
//           color: #888;
//           letter-spacing: 2px;
//           text-transform: uppercase;
//           margin-bottom: 20px;
//         }

//         .fare-block {
//           background: #fedc33;
//           border-radius: 12px;
//           padding: 14px 24px;
//           display: inline-block;
//         }

//         .fare-amount {
//           font-size: 36px;
//           font-weight: 800;
//           color: #1a1a1a;
//           line-height: 1;
//         }

//         .fare-label {
//           font-size: 11px;
//           color: #555;
//           margin-top: 2px;
//           text-align: center;
//         }

//         /* ── Status pill ── */
//         .status-row {
//           display: flex;
//           justify-content: center;
//           padding: 16px 28px 0;
//         }

//         .status-pill {
//           padding: 4px 16px;
//           border-radius: 20px;
//           font-size: 12px;
//           font-weight: 700;
//           letter-spacing: 0.5px;
//           text-transform: uppercase;
//         }

//         .status-completed {
//           background: #d4f8e8;
//           color: #1a8a4a;
//         }

//         .status-cancelled {
//           background: #fde8e8;
//           color: #c0392b;
//         }

//         /* ── Body ── */
//         .body {
//           padding: 24px 28px;
//         }

//         .section-title {
//           font-size: 10px;
//           font-weight: 700;
//           color: #aaa;
//           letter-spacing: 1.5px;
//           text-transform: uppercase;
//           margin-bottom: 12px;
//           margin-top: 24px;
//         }

//         .section-title:first-child {
//           margin-top: 0;
//         }

//         /* ── Route ── */
//         .route {
//           display: flex;
//           flex-direction: column;
//           gap: 0;
//         }

//         .route-point {
//           display: flex;
//           align-items: flex-start;
//           gap: 12px;
//         }

//         .route-icon-col {
//           display: flex;
//           flex-direction: column;
//           align-items: center;
//           padding-top: 2px;
//         }

//         .route-dot {
//           width: 10px;
//           height: 10px;
//           border-radius: 50%;
//           flex-shrink: 0;
//         }

//         .dot-pickup { background: #fedc33; border: 2px solid #1a1a1a; }
//         .dot-dropoff { background: #1a1a1a; }

//         .route-connector {
//           width: 2px;
//           height: 20px;
//           background: #e0e0e0;
//           margin: 3px 0;
//         }

//         .route-label {
//           font-size: 10px;
//           color: #aaa;
//           font-weight: 600;
//           text-transform: uppercase;
//           letter-spacing: 0.5px;
//           margin-bottom: 2px;
//         }

//         .route-name {
//           font-size: 14px;
//           color: #1a1a1a;
//           font-weight: 600;
//           line-height: 1.3;
//           padding-bottom: 12px;
//         }

//         /* ── Info rows ── */
//         .info-row {
//           display: flex;
//           justify-content: space-between;
//           align-items: center;
//           padding: 10px 0;
//           border-bottom: 1px solid #f0f0f0;
//         }

//         .info-row:last-child { border-bottom: none; }

//         .info-label {
//           font-size: 13px;
//           color: #888;
//         }

//         .info-value {
//           font-size: 13px;
//           color: #1a1a1a;
//           font-weight: 600;
//           text-align: right;
//           max-width: 60%;
//         }

//         /* ── Divider ── */
//         .divider {
//           border: none;
//           border-top: 1px dashed #e0e0e0;
//           margin: 20px 0;
//         }

//         /* ── Footer ── */
//         .footer {
//           background: #f9f9f9;
//           border-top: 1px solid #f0f0f0;
//           padding: 20px 28px;
//           text-align: center;
//         }

//         .receipt-id {
//           font-size: 11px;
//           color: #bbb;
//           letter-spacing: 1px;
//           margin-bottom: 6px;
//         }

//         .footer-note {
//           font-size: 11px;
//           color: #aaa;
//           line-height: 1.5;
//         }

//         .footer-brand {
//           font-size: 13px;
//           font-weight: 800;
//           color: #fedc33;
//           margin-top: 12px;
//         }
//       </style>
//     </head>
//     <body>
//       <div class="receipt">

//         <!-- Header -->
//         <div class="header">
//           <div class="brand">UNI<span>ride</span></div>
//           <div class="receipt-label">Ride Receipt</div>
//           <div class="fare-block">
//             <div class="fare-amount">₦${ride.fare || 0}</div>
//             <div class="fare-label">Total Fare</div>
//           </div>
//         </div>

//         <!-- Status -->
//         <div class="status-row">
//           <span class="status-pill ${isCompleted ? 'status-completed' : 'status-cancelled'}">
//             ${isCompleted ? '✓ Completed' : '✕ Cancelled'}
//           </span>
//         </div>

//         <!-- Body -->
//         <div class="body">

//           <!-- Route -->
//           <div class="section-title">Route</div>
//           <div class="route">
//             <div class="route-point">
//               <div class="route-icon-col">
//                 <div class="route-dot dot-pickup"></div>
//                 <div class="route-connector"></div>
//               </div>
//               <div>
//                 <div class="route-label">Pickup</div>
//                 <div class="route-name">${ride.pickup?.name || 'Pickup location'}</div>
//               </div>
//             </div>
//             <div class="route-point">
//               <div class="route-icon-col">
//                 <div class="route-dot dot-dropoff"></div>
//               </div>
//               <div>
//                 <div class="route-label">Destination</div>
//                 <div class="route-name">${ride.destination?.name || 'Destination'}</div>
//               </div>
//             </div>
//           </div>

//           <hr class="divider" />

//           <!-- Ride Details -->
//           <div class="section-title">Ride Details</div>

//           <div class="info-row">
//             <span class="info-label">Date & Time</span>
//             <span class="info-value">${rideDate}</span>
//           </div>
//           <div class="info-row">
//             <span class="info-label">Distance</span>
//             <span class="info-value">${formatDistance(ride.distance)}</span>
//           </div>
//           <div class="info-row">
//             <span class="info-label">Duration</span>
//             <span class="info-value">${formatDuration(ride.duration)}</span>
//           </div>
//           ${
//             ride.driverRating?.rating
//               ? `
//           <div class="info-row">
//             <span class="info-label">Your Rating</span>
//             <span class="info-value">${ride.driverRating.rating}.0 ★</span>
//           </div>`
//               : ''
//           }

//           <hr class="divider" />

//           <!-- People -->
//           <div class="section-title">People</div>

//           <div class="info-row">
//             <span class="info-label">Student</span>
//             <span class="info-value">${studentName}</span>
//           </div>
//           <div class="info-row">
//             <span class="info-label">Driver</span>
//             <span class="info-value">${driverName}</span>
//           </div>

//           <hr class="divider" />

//           <!-- Payment -->
//           <div class="section-title">Payment</div>
//           <div class="info-row">
//             <span class="info-label">Fare</span>
//             <span class="info-value">₦${ride.fare || 0}</span>
//           </div>
//           <div class="info-row">
//             <span class="info-label">Payment Method</span>
//             <span class="info-value">${ride.paymentMethod || 'Cash'}</span>
//           </div>
//         </div>

//         <!-- Footer -->
//         <div class="footer">
//           <div class="receipt-id">Receipt #${receiptId}</div>
//           <div class="footer-note">Thank you for riding with UNIride.<br/>Safe rides built for students.</div>
//           <div class="footer-brand">UNIride</div>
//         </div>

//       </div>
//     </body>
//     </html>
//   `;
// };

// /**
//  * Generate and share/download a PDF receipt for a ride
//  * @param {Object} ride - The ride object from Firestore
//  */
// export const downloadReceipt = async (ride) => {
//   try {
//     // 1. Generate PDF from HTML
//     const { uri } = await Print.printToFileAsync({
//       html: buildReceiptHTML(ride),
//       base64: false,
//     });

//     // 2. Check if sharing is available on this device
//     const isAvailable = await Sharing.isAvailableAsync();

//     if (!isAvailable) {
//       Alert.alert('Not Supported', 'Sharing is not available on this device.');
//       return { success: false, error: 'Sharing not available' };
//     }

//     // 3. Share/save the PDF
//     await Sharing.shareAsync(uri, {
//       mimeType: 'application/pdf',
//       dialogTitle: 'Save your ride receipt',
//       UTI: 'com.adobe.pdf', // iOS
//     });

//     return { success: true };
//   } catch (error) {
//     console.error('❌ Error generating receipt:', error);
//     Alert.alert('Error', 'Could not generate receipt. Please try again.');
//     return { success: false, error: error.message };
//   }
// };
