package com.paymentAPI.repository;

import com.paymentAPI.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    public Payment findByOrderId(String orderId);
}
