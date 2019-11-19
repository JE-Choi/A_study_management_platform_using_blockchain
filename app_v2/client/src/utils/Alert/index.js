import { confirmAlert } from 'react-confirm-alert'; 
import 'react-confirm-alert/src/react-confirm-alert.css';
import './style.css';

const index = {
    // alert 창
    confirm: function (_title, _message) {
      confirmAlert({
        title: _title,
        message: _message,
        buttons: [
        {
          label: '확인'
        }
        ]
      })        
    },
    
    // 새로고침되는 alert 창
    reloadConfirm: function (_title, _message) {
      confirmAlert({
        title: _title,
        message: _message,
        buttons: [
        {
          label: '확인',
          onClick: () => window.location.reload()
        }
        ]
      })        
    },

    replaceConfirm: function (_title, _message, replace) {
      confirmAlert({
        title: _title,
        message: _message,
        buttons: [
        {
            label: '확인',
            onClick: () =>  window.location.replace(replace)
        }
        ]
      })        
    }
}

export default index;
