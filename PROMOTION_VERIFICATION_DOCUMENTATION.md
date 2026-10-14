# Sealify Promotion & Verification System - Documentation

## Overview

This documentation covers Sealify's enhanced promotion system and comprehensive verification mechanisms. The system provides robust payment processing, automatic promotion management, and strict user verification to ensure platform integrity and promote trust in the marketplace.

## Table of Contents

1. [Promotion System](#promotion-system)
2. [Verification System](#verification-system)
3. [API Reference](#api-reference)
4. [Payment Processing](#payment-processing)
5. [Promotion Lifecycle](#promotion-lifecycle)
6. [Verification Requirements](#verification-requirements)
7. [Compliance & Security](#compliance-security)
8. [Admin Dashboard Features](#admin-dashboard-features)
9. [Mobile App Integration](#mobile-app-integration)
10. [Error Handling & Troubleshooting](#error-handling)

## Promotion System

### Overview
The promotion system allows Sealify users to enhance their ad visibility through automated payment processing, admin approval, and lifecycle management. This feature ensures controlled advertising while maintaining platform quality and fairness.

### Promotion Plans

| Plan | Rate (NGN/month) | Features | Badge |
|------|----------------|----------|-------|
| Basic | ₦5,000 | Standard placement | ![Basic](https://via.placeholder.com/20/gray/white?text=B) |
| Standard | ₦10,000 | Priority placement | ![Standard](https://via.placeholder.com/20/amber/white?text=S) |
| Premium | ₦20,000 | Top placement + highlighted | ![Premium](https://via.placeholder.com/20/rose/white?text=P) |
| Enterprise | ₦50,000 | Maximum visibility + business verification | ![Enterprise](https://via.placeholder.com/20/primary/white?text=E) |

### Payment Flow

1. **Create Promotion Request**
   - User selects ad and promotion plan
   - System verifies user eligibility
   - Amount calculated based on plan and duration

2. **Payment Initiation**
   - Flutterwave payment gateway integration
   - Secure payment processing
   - Transaction tracking

3. **Payment Verification**
   - Automatic webhook handling
   - Transaction validation
   - Receipt generation

4. **Admin Approval**
   - Manual review of promotion requests
   - Approval or rejection with notes
   - Activation/deactivation control

5. **Promotion Lifecycle**
   - Active period based on chosen duration
   - Automatic expiration
   - Renewal options for enterprise plans
   - Early termination capabilities

### API Endpoints

#### Create Promotion
```bash
POST /api/promotion/create
```

**Request Body:**
```json
{
    "ad_id": "uuid",
    "plan_name": "basic|standard|premium|enterprise",
    "duration_months": 1
}
```

**Response:**
```json
{
    "promotion": {
        "id": "uuid",
        "ad_id": "uuid",
        "promotion_plan_name": "basic",
        "duration_months": 1,
        "amount": 5000.00,
        "status": "pending"
    },
    "payment_link": "https://payment.flutterwave.com/....",
    "amount": 5000.00,
    "currency": "NGN"
}
```

#### Get User Promotions
```bash
POST /api/promotion/user
```

**Response:**
```json
{
    "promotions": [
        {
            "id": "uuid",
            "ad_id": "uuid",
            "promotion_plan_name": "basic",
            "duration_months": 1,
            "amount": 5000.00,
            "status": "active",
            "starts_at": "2024-01-15T10:00:00Z",
            "expires_at": "2024-02-15T10:00:00Z",
            "ad": {
                "id": "uuid",
                "title": "iPhone 14 Available",
                "price": 450000.00,
                "seller": {"name": "John Doe"}
            },
            "receipts": []
        }
    ]
}
```

#### Admin Approve Promotion
```bash
POST /api/promotion/admin/approve/{promotionId}
```

**Request Body:**
```json
{
    "admin_user_id": "uuid",
    "notes": "Optional approval notes"
}
```

#### Admin Terminate Promotion
```bash
POST /api/promotion/admin/terminate/{promotionId}
```

**Request Body:**
```json
{
    "admin_user_id": "uuid",
    "reason": "Optional termination reason"
}
```

## Verification System

### Overview
The verification system ensures platform integrity by requiring users and businesses to verify their identities and business credentials before accessing premium features and promoting their ads.

### Verification Types

#### User Identity Verification
- **NIN (National Identification Number)**: Nigeria's primary national ID
- **BVN (Bank Verification Number)**: Connects bank accounts to identity
- **Voters Card**: Government-issued voter identification
- **Driver's License**: Official driving permit
- **International Passport**: For international users

#### Business Verification
- **Business Registration Number**: Corporate Affairs Commission (CAC) certificate
- **Tax Identification Number**: V.A.T. registration
- **Official Documents**: Certificate of incorporation, business permit

### Verification Process

1. **Document Submission**
   - Upload clear images of ID documents
   - Submit business registration certificates
   - Provide supporting business documentation

2. **Admin Review**
   - Manual verification of document authenticity
   - Cross-referencing with government databases
   - Background checks for suspicious activities

3. **Approval/Expiration**
   - Verification valid for specified periods
   - Automatic renewal reminders
   - Re-verification required for expired documents

### API Endpoints

#### Create ID Verification
```bash
POST /api/verification/id
```

**Request Body:**
```json
{
    "id_type": "nin|bvn|voters_card|drivers_license|international_passport",
    "id_number": "12345678901234",
    "document": "file_upload"
}
```

#### Create Business Verification
```bash
POST /api/verification/business
```

**Request Body:**
```json
{
    "business_name": "Tech Solutions Limited",
    "business_registration_number": "RC123456",
    "business_address": "123 Business Street, Lagos",
    "documents": ["file_upload_1", "file_upload_2"]
}
```

#### Admin Verify ID Verification
```bash
POST /api/verification/admin/id/{verificationId}
```

**Request Body:**
```json
{
    "admin_user_id": "uuid",
    "status": "verified|rejected",
    "notes": "Optional verification notes",
    "result": "Optional verification result"
}
```

#### Admin Verify Business Verification
```bash
POST /api/verification/admin/business/{verificationId}
```

**Request Body:**
```json
{
    "admin_user_id": "uuid",
    "status": "verified|rejected",
    "notes": "Optional verification notes",
    "result": "Optional verification result"
}
```

#### Get User Verification Status
```bash
GET /api/verification/status
```

**Response:**
```json
{
    "has_verified_identity": true,
    "has_verified_business": false
}
```

## Payment Processing

### Flutterwave Integration

The system uses Flutterwave for secure payment processing:

- **Payment Methods**: Card, USSD, Bank Transfer, QR Code
- **Security**: PCI DSS compliant, encrypted data transmission
- **Webhooks**: Automatic payment verification
- **Refunds**: Secure refund process for failed transactions

### Payment Flow

1. **Payment Initialization**
   - User submits payment request
   - Flutterwave payment page loads
   - Transaction created in system

2. **Payment Verification**
   - Webhook handles payment confirmation
   - Transaction details validated
   - Receipt generated

3. **Success Handling**
   - Promotion activated (after admin approval)
   - Receipt sent to user
   - Notifications sent

### Supported Payment Methods

- **Card Payments**: Visa, Mastercard, Verve
- **Bank Transfers**: All Nigerian banks
- **USSD**: Dial *737# for mobile banking
- **QR Code**: Scan to pay
- **Wallets**: OPay, Paga, PalmPay

## Promotion Lifecycle

### Status Definitions

| Status | Description | Transition To |
|--------|-------------|---------------|
| Pending | Payment received, awaiting admin approval | Approved, Rejected |
| Approved | Admin approved, waiting for activation | Active |
| Active | Currently running promotion | Expired, Terminated |
| Expired | Promotion period ended | (End state) |
| Terminated | Early termination by admin | (End state) |
| Rejected | Admin rejected request | (End state) |

### Lifecycle Management

1. **Creation**: User creates promotion request
2. **Payment**: User completes payment
3. **Admin Review**: Admin approves or rejects
4. **Activation**: Promotion starts (for approved)
5. **Running**: Active promotion period
6. **Expiration**: Automatic termination
7. **Renewal**: Enterprise plan re-activation

## Verification Requirements

### For Ad Promotion

**Mandatory Requirements:**
1. **Identity Verification**: Must have verified NIN or BVN
2. **Terms Acceptance**: Must accept no advance payment policy
3. **Email Verification**: Must have verified email address

**Optional Requirements:**
1. **Business Verification**: For premium/enterprise plans
2. **Phone Verification**: For enhanced security
3. **Address Verification**: For business promotions

### Age & Eligibility Requirements

1. **Minimum Age**: 18 years for all promotions
2. **Legal Capacity**: Must be legally eligible to enter contracts
3. **Business Registration**: Required for business promotions
4. **Tax Compliance**: Valid tax identification for business ads

### Ongoing Requirements

1. **Document Validity**: IDs and business documents must be valid
2. **Compliance**: Must maintain compliance with all regulations
3. **Account Standing**: No suspended or banned accounts

## Compliance & Security

### Legal Compliance

**Nigerian Regulations:**
- **NDPR**: Nigeria Data Protection Regulation compliance
- **anti-money-laundering**: Know Your Customer (KYC) requirements
- **consumer_protection**: Fair advertising practices
- **tax_compliance**: Proper tax collection and reporting

**Platform Policies:**
- **No Advance Payment Policy**: Users cannot request advance payment for products
- **Identity Verification**: Mandatory for all transactions
- **Business Verification**: Required for business promotions
- **Content Moderation**: Automated and manual content review

### Security Measures

**Technical Security:**
- **SSL/TLS Encryption**: Secure data transmission
- **Token-based Authentication**: Sanctum API authentication
- **Rate Limiting**: Protection against brute force attacks
- **Logging & Monitoring**: Comprehensive audit trails

**Data Security:**
- **Data Minimization**: Collect only necessary information
- **Purpose Limitation**: Use data only for specified purposes
- **Storage Security**: Encrypted database storage
- **Access Control**: Role-based access control

## Admin Dashboard Features

### Promotion Management

**Dashboard Overview:**
- **Pending Approvals**: List of promotions awaiting approval
- **Active Promotions**: Currently running promotions
- **Expired Promotions**: Completed promotion history
- **Analytics**: Promotion performance metrics

**Action Tools:**
- **Bulk Approval**: Approve multiple promotions at once
- **Search & Filter**: Find promotions by user, ad, status
- **Advanced Filtering**: Date ranges, status filters
- **Bulk Actions**: Terminate or extend multiple promotions

### Verification Management

**Verification Dashboard:**
- **Pending Reviews**: Verification requests awaiting review
- **Verified Users**: Successfully verified identities
- **Verified Businesses**: Approved business registrations
- **Rejected Applications**: Failed verification attempts

**Review Tools:**
- **Document Viewer**: Preview uploaded documents
- **Cross-reference**: Verify with government databases
- **Decision History**: Track all verification decisions
- **Appeal Management**: Handle user appeals

## Mobile App Integration

### Features

**Push Notifications:**
- Promotion status updates
- Verification decision notifications
- Payment confirmations
- Expiration reminders

**Mobile-Optimized:**
- Responsive design for all screen sizes
- Touch-friendly interface
- Offline capabilities
- Fast loading

**Mobile-Specific Features:**
- Camera integration for document upload
- Mobile payment flows
- Biometric authentication
- QR code scanning for verification

## Error Handling

### Common Errors

**Payment Errors:**
- **Insufficient Funds**: Payment declined due to insufficient balance
- **Invalid Card**: Card details invalid or expired
- **Network Issues**: Temporary payment processing failures
- **Webhook Failure**: Payment confirmation not received

**Verification Errors:**
- **Invalid Document Type**: Unsupported ID or document type
- **Expired Document**: ID or business certificate expired
- **Duplicate Verification**: Already verified for this ID type
- **Missing Documents**: Required documents not uploaded

### Error Responses

**Standard Error Format:**
```json
{
    "error": "Error description",
    "code": "error_code",
    "details": {
        "field": "Validation error message"
    }
}
```

### Troubleshooting

**Common Solutions:**
1. **Document Upload Issues**: Try different file formats (JPEG, PNG, PDF)
2. **Payment Failures**: Check internet connection and card details
3. **Verification Delays**: Allow 2-3 business days for processing
4. **Access Denied**: Ensure all verification requirements are met

## API Authentication

### Sanctum Tokens

All API endpoints require Sanctum token authentication:

```bash
Bearer YOUR_SANCTUM_TOKEN
```

**Token Generation:**
```bash
# For web applications
POST /oauth/token
{
    "grant_type": "password",
    "username": "user@email.com",
    "password": "password",
    "client_id": "client_id_from_env",
    "client_secret": "client_secret_from_env",
    "scope": "*"
}
```

**Environment Variables:**
```bash
SANCTUM_AUTH_SECRET=your_sanctum_secret_key
SANCTUM_STATEFUL=true
SANCTUM_EXPIRATION=60
```

## Migration Guide

### From Previous Version

**Database Changes:**
- New tables created: `ad_promotions`, `ad_promotion_receipts`, `user_verifications`, `business_verifications`, `user_kyc_acceptances`
- Foreign key constraints added
- Indexes created for better performance

**Migration Commands:**
```bash
php artisan migrate --path=database/migrations/2026_10_14_000002_add_promotion_verification_tables.php
```

**Rollback:**
```bash
php artisan migrate:rollback --path=database/migrations/2026_10_14_000002_add_promotion_verification_tables.php
```

## Changelog

### v1.0.0 - Promotion & Verification System

**New Features:**
- Ad promotion system with payment integration
- User ID verification (NIN, BVN, Voters Card, etc.)
- Business verification for commercial users
- Admin approval workflow
- Flutterwave payment processing
- Automatic promotion lifecycle management

**Bug Fixes:**
- Enhanced error handling
- Improved validation
- Better documentation

**Breaking Changes:**
- New database tables
- Updated API endpoints
- Additional authentication requirements

## Support & Contact

### Technical Support
- **Email**: support@sealify.ng
- **Website**: https://sealify.ng/support
- **Live Chat**: Available in app

### Reporting Issues
- **Bug Reports**: Submit through app or website
- **Feature Requests**: Suggest improvements via feedback form
- **Security Issues**: Report to security@sealify.ng

### Documentation Updates
- **API Reference**: Always available at /api/docs
- **User Guides**: Available in app and website
- **Technical Documentation**: For developers at /developers/docs

## Conclusion

The Sealify Promotion & Verification System provides a comprehensive solution for managing ad promotions and ensuring platform integrity. By implementing strict verification requirements, automated payment processing, and admin oversight, Sealify maintains a trusted marketplace environment while providing users with powerful marketing tools.

**Key Benefits:**
- **Trust**: Verified users and businesses
- **Revenue**: Additional income from promotion fees
- **Quality**: Controlled advertising environment
- **Security**: Enhanced platform security
- **Compliance**: Legal and regulatory compliance

**Next Steps:**
1. Implement system in development environment
2. Test all functionality
3. Deploy to staging environment
4. Conduct beta testing
5. Full production rollout
6. Continuous improvement based on user feedback

---

*This documentation is subject to change as the system evolves. Please refer to the latest version for most up-to-date information.*