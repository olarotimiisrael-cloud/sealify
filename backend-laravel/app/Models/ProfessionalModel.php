<?php

namespace App\Models;

use Illuminate\Database\Model;

class SellerAnalytics extends Model
{
    protected $table = 'seller_analytics';
    
    protected $fillable = [
        'seller_id',
        'metric_type',
        'metric_value',
        'period_start',
        'period_end',
        'calculated_at',
    ];
    
    protected $casts = [
        'metric_value' => 'decimal:2',
        'period_start' => 'datetime',
        'period_end' => 'datetime',
        'calculated_at' => 'datetime',
    ];
    
    public function seller()
    {
        return $this->belongsTo(User::class);
    }
}

class AutomationRule extends Model
{
    protected $table = 'automation_rules';
    
    protected $fillable = [
        'seller_id',
        'rule_type',
        'rule_data',
        'is_active',
        'trigger_condition',
        'action_config',
        'created_at',
    ];
    
    protected $casts = [
        'rule_data' => 'array',
        'trigger_condition' => 'array',
        'action_config' => 'array',
        'is_active' => 'boolean',
        'created_at' => 'datetime',
    ];
    
    public function seller()
    {
        return $this->belongsTo(User::class);
    }
}

class ScheduledReport extends Model
{
    protected $table = 'scheduled_reports';
    
    protected $fillable = [
        'seller_id',
        'report_type',
        'schedule_type',
        'schedule_config',
        'recipients',
        'last_sent_at',
        'next_send_at',
        'is_active',
        'report_data',
        'created_at',
    ];
    
    protected $casts = [
        'schedule_config' => 'array',
        'recipients' => 'array',
        'last_sent_at' => 'datetime',
        'next_send_at' => 'datetime',
        'is_active' => 'boolean',
        'report_data' => 'array',
        'created_at' => 'datetime',
    ];
    
    public function seller()
    {
        return $this->belongsTo(User::class);
    }
}

class CustomListing extends Model
{
    protected $table = 'custom_listings';
    
    protected $fillable = [
        'seller_id',
        'title',
        'description',
        'category',
        'price',
        'condition',
        'stock_quantity',
        'views',
        'inquiries',
        'conversions',
        'sold_at',
        'created_at',
        'updated_at',
    ];
    
    protected $casts = [
        'price' => 'decimal:2',
        'stock_quantity' => 'integer',
        'views' => 'integer',
        'inquiries' => 'integer',
        'conversions' => 'integer',
        'sold_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];
    
    public function seller()
    {
        return $this->belongsTo(User::class);
    }
    
    public function soldTransactions()
    {
        return $this->hasMany(SaleTransaction::class, 'listing_id');
    }
}

class PriceOptimization extends Model
{
    protected $table = 'price_optimizations';
    
    protected $fillable = [
        'listing_id',
        'suggested_price',
        'confidence_score',
        'reasoning',
        'market_benchmark',
        'estimated_impact',
        'applied',
        'created_at',
    ];
    
    protected $casts = [
        'suggested_price' => 'decimal:2',
        'confidence_score' => 'decimal:2',
        'market_benchmark' => 'decimal:2',
        'estimated_impact' => 'decimal:2',
        'applied' => 'boolean',
        'created_at' => 'datetime',
    ];
    
    public function listing()
    {
        return $this->belongsTo(CustomListing::class);
    }
}

class InventoryAlert extends Model
{
    protected $table = 'inventory_alerts';
    
    protected $fillable = [
        'seller_id',
        'listing_id',
        'alert_type',
        'threshold_value',
        'current_value',
        'is_active',
        'notification_config',
        'created_at',
    ];
    
    protected $casts = [
        'threshold_value' => 'integer',
        'current_value' => 'integer',
        'is_active' => 'boolean',
        'notification_config' => 'array',
        'created_at' => 'datetime',
    ];
    
    public function seller()
    {
        return $this->belongsTo(User::class);
    }
    
    public function listing()
    {
        return $this->belongsTo(CustomListing::class);
    }
}

class CustomerInsight extends Model
{
    protected $table = 'customer_insights';
    
    protected $fillable = [
        'seller_id',
        'customer_id',
        'customer_name',
        'customer_email',
        'total_purchases',
        'total_spent',
        'first_purchase_date',
        'last_purchase_date',
        'created_at',
        'updated_at',
    ];
    
    protected $casts = [
        'total_purchases' => 'integer',
        'total_spent' => 'decimal:2',
        'first_purchase_date' => 'datetime',
        'last_purchase_date' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];
    
    public function seller()
    {
        return $this->belongsTo(User::class);
    }
}

class SalesForecast extends Model
{
    protected $table = 'sales_forecasts';
    
    protected $fillable = [
        'seller_id',
        'month',
        'projected_revenue',
        'confidence_score',
        'factors',
        'created_at',
    ];
    
    protected $casts = [
        'projected_revenue' => 'decimal:2',
        'confidence_score' => 'decimal:2',
        'factors' => 'array',
        'created_at' => 'datetime',
    ];
    
    public function seller()
    {
        return $this->belongsTo(User::class);
    }
}