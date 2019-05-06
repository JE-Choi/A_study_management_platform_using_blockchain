import React from 'react';
import './App.css';
import $ from 'jquery';

function App() {

  $(document).ready(function(){
     tid = setInterval(function(){
      msg_time();
    } ,1000); // 타이머 1초간격으로 수행
  });

  var tid = 0;
  var stDate = new Date().getTime();
  var edDate = new Date('2019-05-06 18:12:55').getTime(); // 종료날짜
  var RemainDate = edDate - stDate;
   
  function msg_time(){
    var hours = Math.floor((RemainDate % (1000 * 60 * 60 * 24)) / (1000*60*60));
    var miniutes = Math.floor((RemainDate % (1000 * 60 * 60)) / (1000*60));
    var seconds = Math.floor((RemainDate % (1000 * 60)) / 1000);
    
    var m = hours + ":" +  miniutes + ":" + seconds ; // 남은 시간 text형태로 변경
    
    //$('#timer').text(m);
    document.all.timer.innerHTML = m;   // div 영역에 보여줌 
  
    if (RemainDate < 1000) {      
      // 시간이 종료 되었으면..
      clearInterval(tid);   // 타이머 해제
      // alert(RemainDate);
    }else{
      RemainDate = RemainDate - 1000; // 남은시간 -1초
    }
  }


  return (
    <div className="App">
      <div>Timer</div>
      <p>남은시간 : <span id="timer"></span></p>
    </div>
  );
}

export default App;