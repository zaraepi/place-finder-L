// $(document).ready(function() {
//   $('select').niceSelect();
// });

$(function() {
    $('select').niceSelect();

});

// let hotelData = {

// };

// Initiate map
const version = '?v=20170901';
const clientid = '&client_id=AVN22MT2XHHXNHVBHGQMTYOKYCBQOJQMLF1GJOU30N1JDEXH';
const clientSecret = '&client_secret=GU0EDF0V2GPP2GXLCEQMYP1ILA3PG3CPRXCJP23SLMYFU41G';
const key = version + clientid + clientSecret;

// Lines of code to get breakpoint
let breakpoint = {};
breakpoint.refreshValue = function() {
    this.value = window.getComputedStyle(document.querySelector('body'), ':before')
        .getPropertyValue('content').replace(/\"/g, '');
}
$(window).resize(function() {
    breakpoint.refreshValue();
}).resize();

// Pseudo-constructor for divs
$('#search-options').data('isOpen', false);
$('#search-details').data('isOpen', false);


let cafeGroup = L.layerGroup();
let dessertGroup = L.layerGroup();
let restaurantGroup = L.layerGroup();
let barGroup = L.layerGroup();
let scenicGroup = L.layerGroup();




//template i've added this and applied template7 on the html
let detailsHTML = $('#details-template').text();
let detailsTemplate = Template7(detailsHTML).compile();
//

//compile this first once you script template7 in html
let venueHTML = $('#venue-template').text();
let venueTemplate = Template7(venueHTML).compile();

//let center = [-36.849046,174.765305];
let center = [-36.8446152873055, 174.76662397384644];
//let center = [-36.846984961341974,174.76600170135498];
let map = L.map('map', {
    zoomControl: false
}).setView(center, 15);


let multiScenicGroup = L.layerGroup().addTo(map);
let multiCircleGroup = L.layerGroup().addTo(map);

let infoMarker;

let circle = L.circle(center, {
    radius: 800, //original is 500
    color: 'salmon',
    weight: 1,
    fill: false
}).addTo(map);
//L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiYWJldGxvZ2FuIiwiYSI6ImNqNmFhNWw0czEwcWUycG55Z3h3YzFyMGYifQ.txrUggxbLPIanNvZxtaAYQ').addTo(map);
L.tileLayer('https://api.mapbox.com/styles/v1/zaraepi/cj6n0dfpu0asq2smionk3kzm0/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiemFyYWVwaSIsImEiOiJjajZsZ3M5engxczd6MzNyeXVhcmNra2w4In0.uCJg22qFz1JtGhWtOy_6DQ').addTo(map);

function getVenues(center) {

    cafeGroup.clearLayers();
    dessertGroup.clearLayers();
    restaurantGroup.clearLayers();
    barGroup.clearLayers();
    scenicGroup.clearLayers();

    map.removeLayer(circle);

    circle = L.circle(center, {
        radius: 800, //original is 500
        color: 'salmon',
        weight: 0.6,
        fill: false
    }).addTo(map);
    //Explore venues -- foursquare api
    //let exploreUrl = 'https://api.foursquare.com/v2/venues/explore'+key+'&ll=-36.849046,174.765305';
    let exploreUrl = 'https://api.foursquare.com/v2/venues/explore' + key + '&ll=' + center[0] + ',' + center[1];
    $.ajax({
        url: exploreUrl,
        dataType: 'jsonp',
        success: function(res) {
            let data = res.response.groups[0].items;
            console.log(data);

            let venues = _(data).map(function(item) {
                console.log(item.venue.categories["0"].name);

                return {
                    latlng: [item.venue.location.lat, item.venue.location.lng],
                    description: item.venue.name,
                    iconImage: getIcon(item.venue.categories[0].shortName),
                    venueid: item.venue.id,
                    category: item.venue.categories[0].shortName
                };
            });
            _(venues).each(function(venue) {
                let venueIcon = L.icon({
                    iconUrl: venue.iconImage,
                    //iconSize:[35,35]
                    iconSize: [25, 25]
                });
                let marker = L.marker(venue.latlng, {
                    icon: venueIcon
                });

                if ((venue.category.indexOf('Café') > -1) || (venue.category.indexOf('Coffee') > -1) ||
                    (venue.category.indexOf('Bakery') > -1)) {
                    marker.addTo(cafeGroup);
                } else if ((venue.category.indexOf('Desserts') > -1) || (venue.category.indexOf('Ice Cream') > -1) ||
                    (venue.category.indexOf('Ice Cream Shop') > -1) || (venue.category.indexOf('Chocolate') > -1) ||
                    (venue.category.indexOf('Chocolates') > -1)) {
                    marker.addTo(dessertGroup);
                } else if ((venue.category.indexOf('Restaurant') > -1) || (venue.category.indexOf('Steak') > -1) ||
                    (venue.category.indexOf('Food') > -1) || (venue.category.indexOf('Japanese') > -1) ||
                    (venue.category.indexOf('Burgers') > -1) || (venue.category.indexOf('Mexican') > -1) ||
                    (venue.category.indexOf('Pizza') > -1) || (venue.category.indexOf('Vietnamese') > -1) ||
                    (venue.category.indexOf('Australian') > -1) ||
                    (venue.category.indexOf('Middle Eastern') > -1) ||
                    (venue.category.indexOf('Seafood') > -1)) {
                    marker.addTo(restaurantGroup);
                } else if ((venue.category.indexOf('Reserve') > -1) || (venue.category.indexOf('Scenic Lookout') > -1) 
                	||(venue.category.indexOf('Winery') > -1) || (venue.category.indexOf('Vineyard') > -1)
                    || (venue.category.indexOf('Aquarium') > -1) || (venue.category.indexOf('Park') > -1)){
                    marker.addTo(scenicGroup);

                } else if ((venue.category.indexOf('Bar') > -1) ||
                    (venue.category.indexOf('Brewery') > -1)) {
                    marker.addTo(barGroup);
                }

                marker.venueid = venue.venueid;
                marker.on('click', function(e) {
                    //console.log(venue.category);
                    let venueUrl = 'https://api.foursquare.com/v2/venues/' + this.venueid + key;
                    $.ajax({
                        url: venueUrl,
                        dataType: 'jsonp',
                        success: function(res) {
                            let venue = res.response.venue;


                            let iconHTML = '<div>'+res.response.venue.name+'</div>';
                            var myIcon = L.divIcon({className: 'my-div-icon',html:iconHTML,iconSize:[100, 50]});
                            
                            if(infoMarker){
                                map.removeLayer(infoMarker);
                            }
                            infoMarker = L.marker([res.response.venue.location.lat, res.response.venue.location.lng], {icon: myIcon}).addTo(map);



                            //console.log(venue);
                            //-----------------disable----

                            // let hoursUrl = 'https://api.foursquare.com/v2/venues/VENUE_ID/hours' +this.venueid + key;
                            // $.ajax({
                            // 	url:hoursUrl,
                            // 	dataType:'jsonp',
                            // 	success:function(res){
                            // 		let hours = res.response.hours;
                            // 		$('#search-details').text(res.response.hours);																	
                            // 	}
                            // 	});
                            //console.log(timeframes);

                            //let hours = res.response.venue.timeframes;
                            //console.log(timeframes);

                            let photos = res.response.venue.photos.groups[0];

                            //$('.modal-title').text(res.response.venue.name); //unable this

                            //console.log(photos);

                            //$('.modal-body').empty();

                            //let output2 = venueTemplate(photos);

                            //console.log(photos)
                            // _(photos).each(function(photo){
                            // 	let photoPath = photo.prefix +'100x100'+photo.suffix;
                            // 	$('<img src='+photoPath+'>').appendTo('.modal-body');
                            // });

                            //$(output2).appendTo('.modal-body')

                            //$('#myModal').modal('show'); //unable
                            //----------disable---
                            // $('.modal-title').text(res.response.venue.name);
                            // $('.modal-body').empty();

                            // let output =venueTemplate(photos);
                            //let output2 =venueTemplate(photos);//ive added this
                            // console.log(photos);

                            // _(photos).each(function(photo){
                            // 	let photoPath = photo.prefix + '100x100' + photo.suffix;					
                            // 	$('<img src=' + photoPath + '>').appendTo('.modal-body');
                            // });
                            // $('#myModal').modal('show');
                            //-----------------disable----

                            $('#search-details').empty();
                            console.log(venue);

                            let output = detailsTemplate(venue);

                            $(output).appendTo('#search-details');
                        }
                    });

                    toggleSearchDetails();
                    setTimeout(function() {
                        map.invalidateSize(true);
                        map.setView(e.target.getLatLng(), 17); //original is 17
                    }, 500);

                });
            });
        }
    });

}


function getMultiVenues(center) {

    // cafeGroup.clearLayers();
    // dessertGroup.clearLayers();
    // restaurantGroup.clearLayers();
    // barGroup.clearLayers();
    // scenicGroup.clearLayers();

    //map.removeLayer(circle);

    let circle = L.circle(center, {
        radius: 800, //original is 500
        color: 'salmon',
        weight: 0.5,
        fill: false
    }).addTo(multiCircleGroup);
    //Explore venues -- foursquare api
    //let exploreUrl = 'https://api.foursquare.com/v2/venues/explore'+key+'&ll=-36.849046,174.765305';
    let exploreUrl = 'https://api.foursquare.com/v2/venues/explore' + key + '&ll=' + center[0] + ',' + center[1];
    $.ajax({
        url: exploreUrl,
        dataType: 'jsonp',
        success: function(res) {
            let data = res.response.groups[0].items;
            console.log(data);

            let venues = _(data).map(function(item) {
                console.log(item.venue.categories["0"].name);

                return {
                    latlng: [item.venue.location.lat, item.venue.location.lng],
                    description: item.venue.name,
                    iconImage: getIcon(item.venue.categories[0].shortName),
                    venueid: item.venue.id,
                    category: item.venue.categories[0].shortName
                };
            });
            _(venues).each(function(venue) {
                let venueIcon = L.icon({
                    iconUrl: venue.iconImage,
                    //iconSize:[35,35]
                    iconSize: [25, 25]
                });
                let marker = L.marker(venue.latlng, {
                    icon: venueIcon
                });

                if ((venue.category.indexOf('Café') > -1) || (venue.category.indexOf('Coffee') > -1) ||
                    (venue.category.indexOf('Bakery') > -1)) {
                    //marker.addTo(cafeGroup);
                } else if ((venue.category.indexOf('Desserts') > -1) || (venue.category.indexOf('Ice Cream') > -1) ||
                    (venue.category.indexOf('Ice Cream Shop') > -1) || (venue.category.indexOf('Chocolate') > -1) ||
                    (venue.category.indexOf('Chocolates') > -1)) {
                    //marker.addTo(dessertGroup);
                } else if ((venue.category.indexOf('Restaurant') > -1) || (venue.category.indexOf('Steak') > -1) ||
                    (venue.category.indexOf('Food') > -1) || (venue.category.indexOf('Japanese') > -1) ||
                    (venue.category.indexOf('Burgers') > -1) || (venue.category.indexOf('Mexican') > -1) ||
                    (venue.category.indexOf('Pizza') > -1) || (venue.category.indexOf('Vietnamese') > -1) ||
                    (venue.category.indexOf('Australian') > -1) ||
                    (venue.category.indexOf('Middle Eastern') > -1) ||
                    (venue.category.indexOf('Seafood') > -1)) {
                    //marker.addTo(restaurantGroup);
                } else if ((venue.category.indexOf('Reserve') > -1) || (venue.category.indexOf('Scenic Lookout') > -1) 
                    ||(venue.category.indexOf('Winery') > -1) || (venue.category.indexOf('Vineyard') > -1)
                    || (venue.category.indexOf('Aquarium') > -1) || (venue.category.indexOf('Park') > -1)){
                    marker.addTo(multiScenicGroup);

                } else if ((venue.category.indexOf('Bar') > -1) ||
                    (venue.category.indexOf('Brewery') > -1)) {
                    //marker.addTo(barGroup);
                }

                marker.venueid = venue.venueid;
                marker.on('click', function(e) {
                    //console.log(venue.category);
                    let venueUrl = 'https://api.foursquare.com/v2/venues/' + this.venueid + key;
                    $.ajax({
                        url: venueUrl,
                        dataType: 'jsonp',
                        success: function(res) {
                            let venue = res.response.venue;

                            let iconHTML = '<div>'+res.response.venue.name+'</div>';
                            var myIcon = L.divIcon({className: 'my-div-icon',html:iconHTML,iconSize:[100, 50]});
                            
                            if(infoMarker){
                                map.removeLayer(infoMarker);
                            }
                            infoMarker = L.marker([res.response.venue.location.lat, res.response.venue.location.lng], {icon: myIcon}).addTo(map);


                            //console.log(venue);
                            //-----------------disable----

                            // let hoursUrl = 'https://api.foursquare.com/v2/venues/VENUE_ID/hours' +this.venueid + key;
                            // $.ajax({
                            //  url:hoursUrl,
                            //  dataType:'jsonp',
                            //  success:function(res){
                            //      let hours = res.response.hours;
                            //      $('#search-details').text(res.response.hours);                                                                  
                            //  }
                            //  });
                            //console.log(timeframes);

                            //let hours = res.response.venue.timeframes;
                            //console.log(timeframes);

                            let photos = res.response.venue.photos.groups[0];

                            //$('.modal-title').text(res.response.venue.name);//unable this

                            //console.log(photos);

                            //$('.modal-body').empty();

                            //let output2 = venueTemplate(photos);

                            //console.log(photos)
                            // _(photos).each(function(photo){
                            //  let photoPath = photo.prefix +'100x100'+photo.suffix;
                            //  $('<img src='+photoPath+'>').appendTo('.modal-body');
                            // });

                            //$(output2).appendTo('.modal-body')

                            //$('#myModal').modal('show');//unable this
                            //----------disable---
                            // $('.modal-title').text(res.response.venue.name);
                            // $('.modal-body').empty();

                            // let output =venueTemplate(photos);
                            //let output2 =venueTemplate(photos);//ive added this
                            // console.log(photos);

                            // _(photos).each(function(photo){
                            //  let photoPath = photo.prefix + '100x100' + photo.suffix;                    
                            //  $('<img src=' + photoPath + '>').appendTo('.modal-body');
                            // });
                            // $('#myModal').modal('show');
                            //-----------------disable----

                            $('#search-details').empty();
                            console.log(venue);

                            let output = detailsTemplate(venue);

                            $(output).appendTo('#search-details');
                        }
                    });

                    toggleSearchDetails();
                    setTimeout(function() {
                        map.invalidateSize(true);
                        map.setView(e.target.getLatLng(), 17); //original is 17
                    }, 500);

                });
            });
        }
    });

}

function clearMultiVenues(){
    multiScenicGroup.clearLayers();
    multiCircleGroup.clearLayers();


}
//getVenues([-36.849046,174.765305]);
//getVenues([-36.848984961341974,174.76600170135498]);
getVenues([-36.8446152873055, 174.76662397384644]);




//choose locations
$('.span-btn').hide();
$('#city-input').on('change', function() {
    $('.span-btn').show();

    // 	//if($(this).id =='select-city-input'){
    // 	//if(document.querySelector('#select-city-input').selected = true){
    // 		//if(('#select-city-input').select == false){
    if ($('#select-city-input:selected').attr('id') == 'select-city-input') {
        // if (isSelect == false) {  
        $('.span-btn').hide();
        //isSelect = true;
    } else {
        $('.span-btn').show();
        // 		//isSelect = false;
    }


    let value = $(this).val();

    var ll = value.split(",");

    map.setView(ll, 15)

    getVenues(ll);

    // 	// console.log(ll);
});

$('#city-input').on('change', function() {
    if ($('#select-city-input:selected').attr('id') == 'select-city-input') {
        $('.span-btn').hide();
        cafeGroup.removeFrom(map);
        dessertGroup.removeFrom(map);
        restaurantGroup.removeFrom(map);
        barGroup.removeFrom(map);
        scenicGroup.removeFrom(map);
    } else {
        $('.span-btn').show();
    }
    let value = $('#city-input').val();
    var ll = value.split(",");
    map.setView(ll, 15)
    getVenues(ll);
    //$('.span-btn').show();
});
//end of choose locations



//button-scenic showing all 4 locations at the same time//
$('.btn-scenic').on('click',function(){
    let value = $('#city-input').val();
    if(value=='-36.78368259866044,175.01156330108643'){

        getMultiVenues([-36.78914738997797,174.99911785125732]);
        getMultiVenues([-36.797979593341225,175.03478050231934]);
        getMultiVenues([-36.7935464356687,175.06722450256348]);
        getMultiVenues([-36.81175854581354,175.0821590423584]);
        map.setZoom(13);

    }


});






//organize this to new svg 
function getIcon(category) {
    if (~category.indexOf('Bar') || ~category.indexOf('Brewery')) {
        // return 'svg/food/002-soft-drink-3.svg';
        //return 'svg/food/breweryBlack.svg';
        return 'svg/dot-pointer-blue.svg';
    } else if (~category.indexOf('Café') || ~category.indexOf('Coffee')) {
        //return 'svg/food/050-fried-egg.svg';
        //return 'svg/food/cafeBlack.svg';
        return 'svg/dot-pointer-blue.svg';
    } else if (~category.indexOf('Desserts') || ~category.indexOf('Ice Cream') ||
        ~category.indexOf('Chocolates') || ~category.indexOf('Chocolate') ||
        ~category.indexOf('Ice Cream Shop')) {
        //return 'svg/food/008-ice-cream-2.svg';	
        //return 'svg/food/icecreamBlack.svg';
        return 'svg/dot-pointer-blue.svg';
    } else if (~category.indexOf('Restaurant') || ~category.indexOf('Food')) {
        //return 'svg/food/032-bread.svg';	
        //return 'svg/food/restaurantBlack.svg';
        return 'svg/dot-pointer-blue.svg';
    } else if (~category.indexOf('Japanese')) {
        //return 'svg/food/056-sushi.svg';	
        //return 'svg/food/sushiBlack.svg';
        return 'svg/dot-pointer-blue.svg';
    } else if (~category.indexOf('Burgers')) {
        //return 'svg/food/047-burger.svg';
        //return 'svg/food/burgerBlack.svg';
        return 'svg/dot-pointer-blue.svg';
    } else if (~category.indexOf('Mexican')) {
        //return 'svg/food/070-burrito.svg';	
        //return 'svg/food/burritoBlack.svg';
        return 'svg/dot-pointer-blue.svg';
    } else if (~category.indexOf('Steak')) {
        //return 'svg/food/001-steak.svg';	
        //return 'svg/food/steakBlack.svg';
        return 'svg/dot-pointer-blue.svg';
    } else if (~category.indexOf('Pizza')) {
        //return 'svg/food/065-pizza.svg';
        //return 'svg/food/pizzaBlack.svg';
        return 'svg/dot-pointer-blue.svg';
    } else if (~category.indexOf('Bakery')) {
        //return 'svg/food/032-bread.svg';
        //return 'svg/food/breadBlack.svg';
        return 'svg/dot-pointer-blue.svg';
    } else if (~category.indexOf('Vietnamese')) {
        //return 'svg/food/010-pie.svg';
        //return 'svg/food/pieBlack.svg';
        return 'svg/dot-pointer-blue.svg';
    } else if (~category.indexOf('Australian')) {
        return 'svg/dot-pointer-blue.svg';
    } else if (~category.indexOf('Reserve') || ~category.indexOf('Scenic Lookout') ||
        ~category.indexOf('Vineyard') || ~category.indexOf('Winery') ||
        ~category.indexOf('Aquarium') || ~category.indexOf('Park')) {
        return 'svg/dot-pointer-blue.svg';
        //return 'svg/food/065-pizza.svg';
    } else if (~category.indexOf('Middle Eastern')) {
        return 'svg/dot-pointer-blue.svg';
    } else if (~category.indexOf('Seafood')) {
        return 'svg/dot-pointer-blue.svg';
    } else {
        return 'svg/dot-pointer-blue.svg';
    }
}



//add this one (the a,b,c example button)
$('span.btn').on('click', function() {
    let type = $(this).data('type');

    cafeGroup.removeFrom(map);
    dessertGroup.removeFrom(map);
    restaurantGroup.removeFrom(map);
    barGroup.removeFrom(map);
    scenicGroup.removeFrom(map);


    if (type == 'cafe') {
        cafeGroup.addTo(map);
        cafeGroup.eachLayer(function(layer) {
            //console.log(layer);
        });
    }
    if (type == 'dessert') {
        dessertGroup.addTo(map);
    }
    if (type == 'restaurant') {
        restaurantGroup.addTo(map);
    }
    if (type == 'dessert') {
        dessertGroup.addTo(map);
    }
    if (type == 'scenic') {
        scenicGroup.addTo(map);
        //console.log('bla');
    }
    if (type == 'bar') {
        barGroup.addTo(map);
    }
});

$('#start-search').on('click', function(e) {
    e.preventDefault();
    toggleSearchOptions();
});

$('body').on('click', '.search-close', function(e) {
    e.preventDefault();
    closeSection($(this).parent().parent());



});


// $('.search-close').on('click',function(e){
// 	e.preventDefault();
// 	closeSection('#search-options');
// });

$('#search-button').on('click', function(e) {
    e.preventDefault();
    //toggleSearchOptions();
})

//problem here??????
$('.search-close').on('click', function(e) {
    e.preventDefault();
    //closeSection('#search-details');
    //closeSection($('#details-template').text());
    $('#search-details').data('isOpen', false);
    //ive added this thursday
  //   if ($('.search-close').data('isOpen') == false) {
  //        map.removeLayer(infoMarker);

  // }

});


//added this thursday
$('.search-close').on('click',function(e){
    e.preventDefault();
     // if ($('.search-close').data('isOpen') == false) {
     //     //.removeLayer(infoMarker);
     // }else{
     //     ($('.search-close').data('isOpen') == true) 
     //     map.removeLayer(infoMarker);
     // }

     if ($('.search-close').data('isOpen') == false){
          map.removeLayer(infoMarker);
     }
        
});





// FUNCTIONS
function toggleSearchOptions() {
    $('#search-options').slideToggle(500, 'swing');
    toggleSearchData('#search-options');
    if ($('#search-details').data('isOpen') == true) {
        toggleSearchDetails();
    }
    // $('#map').css('height','calc(100vh-');
}

function closeSection(div) {
    $(div).slideToggle(500, 'swing');
    toggleSearchData($(div));
    if (div[0].id == 'search-details') {
        if (breakpoint.value == 'phone') {
            $('#map').css('height', 'calc(100vh - 58px)');
            setTimeout(function() {
                map.invalidateSize(true);
            }, 500);
        } else if (breakpoint.value == 'tablet') {
            $('#map').css('height', '100vh');
            setTimeout(function() {
                map.invalidateSize(true);
            }, 500);
        }

    }
}

function toggleSearchData(id) {
    if ($(id).data('isOpen') == true) {
        $(id).data('isOpen', false);
    } else {
        $(id).data('isOpen', true);
    }
    // remove after doing testing.
    console.log('open: ' + $(id).data('isOpen'));
}

function toggleSearchDetails() {
    if ($('#search-details').data('isOpen') == false) {
        $('#search-details').slideToggle(500, 'swing');
        toggleSearchData('#search-details');
        if (breakpoint.value == 'phone') {
            $('#map').css('height', 'calc(50vh - 58px)');
        } else if (breakpoint.value == 'tablet') {
            $('#map').css('height', '50vh');
        }
    }
}

//$('.span-btn').hide();
// $('#select-city-input').on('click',function(){

// 	 $('.span-btn').hide();

// });
//  


$('.custom-select').on('click', function(event) {
    event.preventDefault();

    //$(this).find('.custom-select').first().stop(true, true).slideDown();
    $('.custom-select>option').slideDown('slow');

});

// $(document).on("hide.bs.dropdown", ".dropdown", function (event) {
//     $(event.target).find(">.dropdown-menu:first").slideUp();
// });

// $(document).on("show.bs.dropdown", ".dropdown", function (event) {
//     $(event.target).find(">.dropdown-menu:first").slideDown();
// });



// var greenIcon = L.icon({
//     iconUrl: 'leaf-green.png',
//     shadowUrl: 'leaf-shadow.png',

//     iconSize:     [38, 95], // size of the icon
//     shadowSize:   [50, 64], // size of the shadow
//     iconAnchor:   [22, 94], // point of the icon which will correspond to marker's location
//     shadowAnchor: [4, 62],  // the same for the shadow
//     popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
// });



// http://leafletjs.com/reference-1.2.0.html#icon

// http://leafletjs.com/examples/custom-icons/
