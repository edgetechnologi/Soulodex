<?php
class Channels
{
    public $category = "";
    public $channelName = "";
    public $_id;
        
   public function __construct()
    {
        print 'I am the news model';
    }
    
    private function IsNullOrEmpty($string){
        return (!isset($string) || trim($string) === '');
    }
}
