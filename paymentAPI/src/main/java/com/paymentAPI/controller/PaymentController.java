package com.paymentAPI.controller;

import com.paymentAPI.entity.Payment;
import com.paymentAPI.repository.PaymentRepository;
import com.razorpay.*;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Random;

@RestController
@RequestMapping("/payment")
@CrossOrigin(origins = "http://localhost:3000")
public class PaymentController {

    @Autowired
    private PaymentRepository paymentrepository;

    @PostMapping("/create-order")
    @ResponseBody
    public String createOrder(@RequestBody Map<String, Object> data) throws RazorpayException {
//        System.out.println("Order Created======================>>>>"+data);

        int amount = Integer.parseInt(data.get("amount").toString());

        Random random = new Random();
        int receipt = random.nextInt(50000);

        var razorpay = new RazorpayClient("rzp_test_gym23pa0YynSmB", "HknRFuLD3qhcMxrFqrt5hTCK");

        JSONObject orderRequest = new JSONObject();
        orderRequest.put("amount", amount*100);
        orderRequest.put("currency", "INR");
        orderRequest.put("receipt", "order_rcptid_"+receipt);

        Order order = razorpay.orders.create(orderRequest);
//        System.out.println("--------------"+order);

        // saving into DB
        Payment payment = new Payment();
        payment.setOrderId(order.get("id"));
        int amt = order.get("amount");
        payment.setAmount(amt/100+"");
        payment.setReceipt(order.get("receipt"));
        payment.setStatus("created");
        payment.setPaymentId(null);

        paymentrepository.save(payment);

        return order.toString();
    }

    @PostMapping("/update-order")
    public ResponseEntity<?> updateOrder(@RequestBody Map<String, Object> data) {
        Payment payment = paymentrepository.findByOrderId(data.get("order_id").toString());

        payment.setPaymentId(data.get("payment_id").toString());
        payment.setStatus(data.get("status").toString());

        paymentrepository.save(payment);
        return ResponseEntity.ok("order updated");
    }
}
