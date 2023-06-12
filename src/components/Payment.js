import React, { useState, useEffect } from "react";
import "./Payment.css";

const Payment = () => {
	const [amount, setAmount] = useState("");

	useEffect(() => {
		const script = document.createElement("script");
		script.src = "https://checkout.razorpay.com/v1/checkout.js";
		script.async = true;
		document.body.appendChild(script);
		return () => {
			document.body.removeChild(script);
		};
	}, []);

	const updatePaymentOnServer = async (paymentId, orderId, status) => {
		try {
			await fetch("http://localhost:8080/payment/update-order", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					payment_id: paymentId,
					order_id: orderId,
					status,
				}),
			});

			alert("Payment successful");
		} catch (error) {
			alert("server couldn't save payment");
			console.error(error);
		}
	};

	const handleChange = (event) => {
		const amount = event.target.value;
		setAmount(amount);
	};

	const handleSubmit = async (event) => {
		event.preventDefault();

		if (amount === "" || amount === null) {
			alert("Amount is required");
			return;
		}

		try {
			const response = await fetch(
				"http://localhost:8080/payment/create-order",
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ amount: amount }),
				}
			);

			const content = await response.json();
			console.log(content);

			if (content.status === "created") {
				let options = {
					key_id: "rzp_test_gym23pa0YynSmB",
					amount: content.amount,
					currency: "INR",
					name: "Payment Integration App",
					order_id: content.id,

					handler: (response) => {
						console.log(response.razorpay_payment_id);
						console.log(response.razorpay_order_id);
						console.log(response.razorpay_signature);

						updatePaymentOnServer(
							response.razorpay_payment_id,
							response.razorpay_order_id,
							"paid"
						);
					},
					prefill: {
						name: "",
						email: "",
						contact: "",
					},
					notes: {
						address: "123 Street",
					},
					theme: {
						color: "#3399cc",
					},
				};

				let rzp = new window.Razorpay(options);

				rzp.on("payment.failed", function (response) {
					console.log(response.error.code);
					console.log(response.error.description);
					console.log(response.error.source);
					console.log(response.error.step);
					console.log(response.error.reason);
					console.log(response.error.metadata.order_id);
					console.log(response.error.metadata.payment_id);
				});

				rzp.open();
			}
		} catch (error) {
			console.error(error);
		}
	};
	return (
		<section>
			<div className="form-box">
				<div className="form-value">
					<form action="" onSubmit={handleSubmit}>
						<h2>Make Payment</h2>
						<div className="inputbox">
							<input
								type="text"
								name="amount"
								id="amount"
								value={amount}
								onChange={handleChange}
							/>
							<label htmlFor="amount">Amount</label>
						</div>
						<button type="submit">Checkout</button>
					</form>
				</div>
			</div>
		</section>
	);
};

export default Payment;
