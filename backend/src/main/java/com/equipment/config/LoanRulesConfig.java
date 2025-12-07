package com.equipment.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * Configuration for loan business rules
 * These can be overridden via application.properties or environment variables
 */
@Configuration
@ConfigurationProperties(prefix = "loan.rules")
public class LoanRulesConfig {
    
    /**
     * Maximum number of active loans a user can have at once
     */
    private int maxLoansPerUser = 5;
    
    /**
     * Maximum loan duration in days
     */
    private int maxLoanDurationDays = 30;
    
    /**
     * Default loan duration in days if not specified
     */
    private int defaultLoanDurationDays = 14;
    
    /**
     * Minimum loan duration in days
     */
    private int minLoanDurationDays = 1;
    
    /**
     * Grace period in days before a loan is considered overdue
     */
    private int gracePeriodDays = 0;

    public int getMaxLoansPerUser() {
        return maxLoansPerUser;
    }

    public void setMaxLoansPerUser(int maxLoansPerUser) {
        this.maxLoansPerUser = maxLoansPerUser;
    }

    public int getMaxLoanDurationDays() {
        return maxLoanDurationDays;
    }

    public void setMaxLoanDurationDays(int maxLoanDurationDays) {
        this.maxLoanDurationDays = maxLoanDurationDays;
    }

    public int getDefaultLoanDurationDays() {
        return defaultLoanDurationDays;
    }

    public void setDefaultLoanDurationDays(int defaultLoanDurationDays) {
        this.defaultLoanDurationDays = defaultLoanDurationDays;
    }

    public int getMinLoanDurationDays() {
        return minLoanDurationDays;
    }

    public void setMinLoanDurationDays(int minLoanDurationDays) {
        this.minLoanDurationDays = minLoanDurationDays;
    }

    public int getGracePeriodDays() {
        return gracePeriodDays;
    }

    public void setGracePeriodDays(int gracePeriodDays) {
        this.gracePeriodDays = gracePeriodDays;
    }
}

