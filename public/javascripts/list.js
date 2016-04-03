$(function() {
  $('.map-holder').each(function(){
    var center = $(this).data('center');
    var newImg = requestMapImage(center);
    $(this).append(newImg);
  });
});

function requestMapImage(center) {
  var mapRequest = {
    center: center,
    size: "300x200",
    zoom: "18",
    maptype: "roadmap",
    markers: "color:red|label:A|"+center,
    key: "AIzaSyAYOMRlzJ32KKjQbFrfwCq9SR9AnBmlVKI"}
  query = $.param(mapRequest);
  baseUrl = "https://maps.googleapis.com/maps/api/staticmap";
  fullUrl = baseUrl + '?'+query;
  img = $('<img>');
  img.attr('src',fullUrl);
  return img;
}
