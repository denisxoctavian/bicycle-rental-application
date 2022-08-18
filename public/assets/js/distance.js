var global_id;
var endedRaceDate;
var startedRaceDate;
function startRide(){
    startedRaceDate = Date();				
    document.getElementById('startTime').innerHTML = startedRaceDate;
		document.getElementById('start').value =startedRaceDate;
  
  }

function endRide(){
		endedRaceDate = Date();
    document.getElementById('stop').value =endedRaceDate;

		Ride(startedRaceDate,endedRaceDate);
}

function haversine_distance(mk1, mk2) {
      var R = 6371.07108; 
      var rlat1 = mk1.lat * (Math.PI/180); 
      var rlat2 = mk2.lat * (Math.PI/180); 
      var difflat = rlat2-rlat1; 
      var difflon = (mk2.lng-mk1.lng) * (Math.PI/180); 
      var d = 2 * R * Math.asin(Math.sqrt(Math.sin(difflat/2)*Math.sin(difflat/2)+Math.cos(rlat1)*Math.cos(rlat2)*Math.sin(difflon/2)*Math.sin(difflon/2)));
      return d;
    }

  function Ride(a,b) {
      const x = {lat: 44.866291, lng: 24.866852};
      const y = {lat: 44.85708, lng:  24.87282};
      var distance = haversine_distance(x, y).toFixed(2)*1000;
      var ppm = document.getElementById('payperminute').innerHTML;
      var time = (Date.parse(b)-Date.parse(a))/60000;
      var gross_payment = parseFloat(time*ppm);
      document.getElementById('amount').value = gross_payment;
      document.getElementById('distance').value=distance;

}


