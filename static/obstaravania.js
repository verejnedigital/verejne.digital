      function close_button(divid) {
          return "<button type=\"button\" class=\"close\" onmousedown=\"close_div('" + divid + "')\"><span aria-hidden=\"true\">&times;</span></button>";
        }

        function close_div(divid) {
          document.getElementById(divid+'_long').style.display = 'none';
          document.getElementById(divid).style.display = 'block';
        }

        function getSearchInfo(eid, divid) {
            var resultsText;
            var req = serverURL + 'getInfo?eid=' + eid;
            var xmlhttp = new XMLHttpRequest();
            xmlhttp.onreadystatechange = function() {
                if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                    var jsonData = JSON.parse(xmlhttp.responseText);
                    document.getElementById(divid+'_long').innerHTML = close_button(divid) + displayInfoPrepojenia(jsonData, eid);
                    document.getElementById(divid+'_long').style.display = 'block';
                    document.getElementById(divid).style.display = 'none';
                }
            }
            xmlhttp.open("GET", req, true);
            xmlhttp.send();
        }