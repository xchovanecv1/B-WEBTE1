var map;
            var panorama;
            var homeLatLng;
            var input;
            var searchBox;
            var directionsDisplay;
            var directionsService;
            var lastNavigatePlace = null;
            var marker;
          function myMap() {

          directionsService = new google.maps.DirectionsService();
          directionsDisplay = new google.maps.DirectionsRenderer();


          homeLatLng = new google.maps.LatLng(48.151775, 17.073345);

          var mapProp= {
              center:homeLatLng,

              streetViewControl: false,
              zoom:15,
          };
          map=new google.maps.Map(document.getElementById("googleMap"),mapProp);


          directionsDisplay.setMap(map);


          panorama = new google.maps.StreetViewPanorama(
              document.getElementById('googleMapStreet'), {
                position: homeLatLng,
                pov: {
                  heading: 14,
                  pitch: 5
                }
              });
          map.setStreetView(panorama);

          /////////////////////////////                         TRASA
          input = document.getElementById('pac-input');
          searchBox = new google.maps.places.SearchBox(input);


          searchBox.addListener('places_changed', function() {
          var places = searchBox.getPlaces();

          if (places.length == 0) {
            return;
          }

          

          mapNavigate(places[0].geometry.location);

          });

          /////////////////////////////////////////////////////////////////////////
 /*         marker = new google.maps.Marker({
            position: homeLatLng,
            map: map,
            draggable: false,
            raiseOnDrag: false,

          });
*/
          var marker = new MarkerWithLabel({
		       position: homeLatLng,
		       draggable: false,
		       raiseOnDrag: false,
		       map: map,
		       labelContent: "Fakulta Elektrotechniky a Informatiky",
		       labelAnchor: new google.maps.Point(100, -2),
		       labelClass: "labels", // the CSS class for the label
		       labelStyle: {opacity: 0.75}
		     });




          var request = {
            location: homeLatLng,
            radius: '1000',
            type: ['bus_station']
          };

          service = new google.maps.places.PlacesService(map);
          service.nearbySearch(request, callback);

          var infowindow = new google.maps.InfoWindow({
            content: "Súradnice markera: "+marker.getPosition()
          });



          google.maps.event.addListener(marker, 'click', function() {
            infowindow.open(map, marker);
          });
        }

        function mapNavigate(mapOrigin)
        {

          var drivType = document.getElementById("driveType");
          var finalType = google.maps.TravelMode.DRIVING;

          if(drivType.options[drivType.selectedIndex].value)
          {
            switch(drivType.options[drivType.selectedIndex].value)
            {
              case "walk":
                finalType = google.maps.TravelMode.WALKING;
              break;

              default:
                finalType = google.maps.TravelMode.DRIVING;
              break;
            }
          }
          var request = {
            origin: mapOrigin,
            destination: homeLatLng,
            travelMode: finalType
          };
          directionsService.route(request, function(result, status) {
            if (status == google.maps.DirectionsStatus.OK) {
              //console.log(result);
              lastNavigatePlace = mapOrigin;



              directionsDisplay.setDirections(result);


              var msg_outer = document.getElementById("lengthMsg");
              var msg = document.getElementById("kilometraz");
              if(msg_outer && msg)
              {
                  msg.textContent = result.routes[0].legs[0].distance.text;
                  msg_outer.style.display = "block";
              }

            } else {
              alert("Nastavenie navigácie z Vami zvoleného miest sa nepodarilo! Miesto neexistuje alebo nie je možné nájsť trasu.");
            }
          });

        }

        function renaviagte(){

          if(lastNavigatePlace != null)
          {
            mapNavigate(lastNavigatePlace);
          }

        }

        function addMarker(place) {
            var marker = new google.maps.Marker({
              map: map,
              position: place.geometry.location,
              icon: {
                url: 'https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png',
                anchor: new google.maps.Point(10, 10),
                scaledSize: new google.maps.Size(10, 17)
              }
            });
          }
        function callback(results, status) {
          if (status == google.maps.places.PlacesServiceStatus.OK) {
            for (var i = 0; i < results.length; i++) {
              var place = results[i];
              addMarker(place);
            }
          }
        }

		google.maps.event.addDomListener(window, 'load', myMap);