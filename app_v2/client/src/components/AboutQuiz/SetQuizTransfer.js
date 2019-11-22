import { post } from 'axios';
import InitContract from '../BlockChain/InitContract';
import Sha256 from 'sha256';
import DBControl_txn from '../../utils/DBControl_txn';

const SetQuizTransfer = {
  sender_data: null,
  receiver_data: null,
  
  // 스마트 계약 지각 거래발생
  run: async function(_study_id, _sender_id, _receiver_id, _coin, _quiz_date, _time){
        return new Promise(function (resolve, reject) {
        let is_transaction = false;
        SetQuizTransfer.getAccountId(_study_id, _sender_id, _receiver_id).then((is_end)=>{
          if(is_end === true){
            console.log('sender_data: ', SetQuizTransfer.sender_data);
            console.log('receiver_data: ',SetQuizTransfer.receiver_data);
            let sender_data = SetQuizTransfer.sender_data[0];
            let receiver_data = SetQuizTransfer.receiver_data[0];

            let senderId = InitContract.web3.utils.fromAscii(sender_data.PERSON_ID); 
            let senderName = InitContract.web3.utils.fromAscii(sender_data.PERSON_NAME);
            let senderAddress = sender_data.account_num;

            let receiverId = InitContract.web3.utils.fromAscii(receiver_data.PERSON_ID);
            let receiverName = InitContract.web3.utils.fromAscii(receiver_data.PERSON_NAME);
            let receiverAddress = receiver_data.account_num;
            let transaction_date = InitContract.web3.utils.fromAscii(_quiz_date);
            let transaction_time = InitContract.web3.utils.fromAscii(_time);
            console.log(
            {'senderId':senderId},
            {'senderName':senderName},
            {'senderAddress':senderAddress},
            {'receiverName':receiverName},
            {'receiverAddress':receiverAddress},
            {'_study_id':_study_id},
            {'_coin':_coin},
            {'transaction_date':transaction_date});
            let idx_hash = Sha256(_quiz_date+"_"+sender_data.PERSON_ID+receiver_data.PERSON_ID+_coin).substr(0,64);
            InitContract.web3.eth.personal.unlockAccount(senderAddress, "", 0).then(()=>{
              console.log(sender_data.PERSON_NAME+' unlock');
              InitContract.QuizTransferInstance.methods.setStudyQuizTransfer(
                senderId, senderName, receiverId, receiverName,  InitContract.web3.utils.toWei(String(_coin)),
                transaction_date, _study_id, receiverAddress, '0x'+idx_hash, transaction_time).send(
                    { 
                        from: senderAddress,
                        value: InitContract.web3.utils.toWei(String(_coin), 'ether'),
                        gas: 0 
                    }).on('confirmation', (confirmationNumber, receipt) => {
                        console.log('거래 완료'+sender_data.PERSON_NAME+'>'+receiver_data.PERSON_NAME);
                        DBControl_txn.callInsertTxnInfo(idx_hash, receipt.transactionHash.substr(2), receiverAddress);
                        if(is_transaction === false){
                            is_transaction = true;
                            resolve(true);
                        }
                    });
            });
          }
        });
        });
    },

    //특정 계좌정보와 person_info 테이블 정보 얻어오기
    getAccountId : async function(_study_id, _sender_id, _receiver_id){
      return new Promise(function (resolve, reject) {
        const url = '/api/community/getAccountInfo/personInfo';
        let check = 0;
        post(url, {
            study_id : _study_id,
            person_id : _sender_id
        }).then((sender_data)=>{
          check = check + 1;
          if(check === 2){
            resolve(true);
          }
          SetQuizTransfer.sender_data = sender_data.data;
          console.log({'sender_data':sender_data.data});
        }); 

        post(url, {
          study_id : _study_id,
          person_id : _receiver_id
        }).then((receiver_data)=>{
          check = check + 1;
          if(check === 2){
            resolve(true);
          }
          SetQuizTransfer.receiver_data = receiver_data.data;
          console.log({'receiver_data':receiver_data.data});
        }); 
        
      });
    }
};
  
export default SetQuizTransfer;