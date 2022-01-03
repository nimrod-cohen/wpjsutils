<?php
/**
* Plugin Name: WPJSUtils
* Plugin URI: https://google.com?q=who+is+the+dude/
* Description: A set of JS utilities for WP development
* Version: 1.0.0
* Author: Nimrod Cohen
* Author URI: https://google.com/?q=who+is+the+dude
* Tested up to: 5.8.2
* Requires: 5.0.0 or higher
* License: GPLv3 or later
* License URI: http://www.gnu.org/licenses/gpl-3.0.html
* Requires PHP: 7.1
* Text Domain: wpjsutils
* Domain Path: /languages
*
* Copyright 2020- nimrod cohen
*
* This program is free software; you can redistribute it and/or modify
* it under the terms of the GNU General Public License, version 3, as
* published by the Free Software Foundation.
*
* This program is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
* GNU General Public License for more details.
*
* You should have received a copy of the GNU General Public License
* along with this program; if not, write to the Free Software
* Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA  02110-1301  USA
*/

class WPJSUtils {
  function __construct() {
    add_action( 'init', [$this, 'init'] );
  }

  function init() {
    $cachebust = date('Y_m_d_H');
    wp_enqueue_script( 'wpjsutils', plugin_dir_url(__FILE__).'js/jsutils.js?time='.$cachebust);
    wp_enqueue_script( 'remodaler-js', plugin_dir_url(__FILE__).'js/remodaler.js?time='.$cachebust,["wpjsutils"]);
    wp_enqueue_style( 'remodaler-css', plugin_dir_url(__FILE__).'css/remodaler.css?time='.$cachebust);
    wp_enqueue_script( 'popover-js', plugin_dir_url(__FILE__).'js/popover.js?time='.$cachebust,["wpjsutils"]);
    wp_enqueue_style( 'popover-css', plugin_dir_url(__FILE__).'css/popover.css?time='.$cachebust);
    wp_enqueue_script( 'notifications-js', plugin_dir_url(__FILE__).'js/notifications.js?time='.$cachebust,["wpjsutils"]);
    wp_enqueue_style( 'notifications-css', plugin_dir_url(__FILE__).'css/notifications.css?time='.$cachebust);
    
    wp_enqueue_script( 'infinity-js', plugin_dir_url(__FILE__).'js/infinityscroll.js?time='.$cachebust,["wpjsutils"]);
    
    wp_enqueue_script( 'monthpicker-js', plugin_dir_url(__FILE__).'js/monthpicker.js?time='.$cachebust,["wpjsutils"]);
    wp_enqueue_style( 'monthpicker-css', plugin_dir_url(__FILE__).'css/monthpicker.css?time='.$cachebust);    
  }
}

$wpjsu = new WPJSUtils();