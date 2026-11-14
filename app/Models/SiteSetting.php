<?php

namespace App\Models;

use Database\Factories\SiteSettingFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SiteSetting extends Model
{
    /** @use HasFactory<SiteSettingFactory> */
    use HasFactory;

    protected $fillable = [
        'logo_url', 'site_name', 'site_description', 'og_image', 'favicon_url', 'apple_touch_icon_url',
        'page_title_home', 'theme_color', 'contact_email', 'contact_phone', 'is_active',
        // SEO Settings
        'meta_title', 'meta_description', 'meta_keywords', 'google_analytics_id', 'google_tag_manager_id',
        'facebook_pixel_id', 'robots_txt', 'sitemap_xml',
        // AdSense Settings
        'adsense_enabled', 'adsense_client_id', 'adsense_slot_home', 'adsense_slot_listing', 'adsense_slot_detail',
        'adsense_auto_ads', 'adsense_placement_home_top', 'adsense_placement_home_bottom', 'adsense_placement_listing_top',
        'adsense_placement_listing_bottom', 'adsense_placement_detail_top', 'adsense_placement_detail_bottom',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'adsense_enabled' => 'boolean',
            'adsense_auto_ads' => 'boolean',
            'adsense_placement_home_top' => 'boolean',
            'adsense_placement_home_bottom' => 'boolean',
            'adsense_placement_listing_top' => 'boolean',
            'adsense_placement_listing_bottom' => 'boolean',
            'adsense_placement_detail_top' => 'boolean',
            'adsense_placement_detail_bottom' => 'boolean',
        ];
    }
}
