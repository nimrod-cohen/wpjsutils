<?php
/**
* Plugin Name: WPJSUtils
* Plugin URI: https://google.com?q=who+is+the+dude/
* Description: A set of JS utilities for WP development
* Version: 1.1.4
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

    add_action('wp_ajax_nopriv_check_email', [$this, 'checkEmailAddress']);
    add_action('wp_ajax_check_email', [$this, 'checkEmailAddress']);
  }

  function init() {
    $plugin_data = get_plugin_data( __FILE__ );
    $plugin_version = $plugin_data['Version'];
    $cachebust = "?time=".date('Y_m_d_H')."&v=".$plugin_version;

    wp_enqueue_script( 'wpjsutils', plugin_dir_url(__FILE__).'js/jsutils.js'.$cachebust);
    wp_enqueue_script( 'emailvalidator-js', plugin_dir_url(__FILE__).'js/emailvalidator.js'.$cachebust,["wpjsutils"]);
    wp_enqueue_script( 'remodaler-js', plugin_dir_url(__FILE__).'js/remodaler.js'.$cachebust,["wpjsutils"]);
    wp_enqueue_style( 'remodaler-css', plugin_dir_url(__FILE__).'css/remodaler.css'.$cachebust);
    wp_enqueue_script( 'popover-js', plugin_dir_url(__FILE__).'js/popover.js'.$cachebust,["wpjsutils"]);
    wp_enqueue_style( 'popover-css', plugin_dir_url(__FILE__).'css/popover.css'.$cachebust);
    wp_enqueue_script( 'notifications-js', plugin_dir_url(__FILE__).'js/notifications.js?'.$cachebust,["wpjsutils"]);
    wp_enqueue_style( 'notifications-css', plugin_dir_url(__FILE__).'css/notifications.css'.$cachebust);
    
    wp_enqueue_script( 'infinity-js', plugin_dir_url(__FILE__).'js/infinityscroll.js'.$cachebust,["wpjsutils"]);
    
    wp_enqueue_script( 'monthpicker-js', plugin_dir_url(__FILE__).'js/monthpicker.js'.$cachebust,["wpjsutils"]);
    wp_enqueue_style( 'monthpicker-css', plugin_dir_url(__FILE__).'css/monthpicker.css'.$cachebust);    
    wp_enqueue_script( 'switch-js', plugin_dir_url(__FILE__).'js/switch.js'.$cachebust,["wpjsutils"]);
    wp_enqueue_style( 'switch-css', plugin_dir_url(__FILE__).'css/switch.css'.$cachebust);

    wp_localize_script('wpjsutils',
		'wpjsutils_data', [
			'ajax_url' => admin_url('admin-ajax.php')
		]);
  }

  /*
  function checkEmailSMTP($email) {
    $connect = null;
    $result = true;

    try {
      //TODO: have the email address set in settings
      $from = "yinon@bursa4u.com";
      list($user, $domain) = explode('@', $email);
      list($fromUser, $fromDomain) = explode('@', $from);

      getmxrr($domain, $mxhosts, $mxweight);
    
      if(empty($mxhosts) ) throw new Exception('Domain without MX records');
      
      $mxIP = $mxhosts[array_search(min($mxweight), $mxweight)];
      
      $connect = @fsockopen($mxIP, 25);

      if(!$connect) throw new Exception('Cannot connect to domain');

      $response = fgets($connect);
      if(!preg_match("/^220/i", $response)) throw new Exception('Domain refused connection');
      
      fputs($connect , "EHLO ".$fromDomain."\r\n");
      $response = fgets($connect);

      fputs($connect , "MAIL FROM: <".$from.">\r\n");
      $response = fgets($connect);
      
      fputs($connect , "RCPT TO: <".$email.">\r\n");
      $response = fgets($connect);
      if(!preg_match("/^250/i", $response)) throw new Exception('Email address refused by server');
 
    } catch(Exception $ex) {
      $result = false;
    }
    
    if($connect) {
      fputs ($connect , "QUIT");
      fclose($connect);
    }

    return $result;
  }
  */

  function checkEmailAddress() {
    $result = ["success" => true];

    try {
      $email = $_POST["email"];
      if(!filter_var($email, FILTER_VALIDATE_EMAIL)) throw new Exception('Invalid email address');

      list($user, $domain) = explode('@', $email);

      if($domain == 'gmail.com' && strlen($user) <= 4) throw new Exception("Gmail address too short");

      $dig = shell_exec("dig MX ".$domain." +short");

      if(strlen($dig) == 0) throw new Exception('Domain without MX records');

      //this returns a bogus mx203.inbound-mx.org and mx203.inbound-mx.net records on the server.
      //if(!checkdnsrr($domain, 'MX')) throw new Exception('Domain without MX records');

      //this check is too dangerous - can hang and can just take too much time.
      // if(!strstr($domain, 'yahoo') && !strstr($domain, 'hotmail')) {
      //    if(!$this->checkEmailSMTP($email)) throw new Exception('Failed to connect with SMTP');
      // }     
    } catch(Exception $ex) {
      $result["success"] = false;
    }

    echo json_encode($result);
    die;
  }
}

$wpjsu = new WPJSUtils();