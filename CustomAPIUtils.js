import axios from 'axios';
import GlobalUtils from './GlobalUtils';
import FireStorageUtils from './FireStorageUtils';
import LocaleUtils from './LocaleUtils';
import DataUtils from './DataUtils';
import PhotoUtils from './PhotoUtils';

const API_SERVER_URL = 'https://wevision-prediction.cognitiveservices.azure.com';
const CASH_API_URL = API_SERVER_URL + '/customvision/v3.0/Prediction/49bb4634-439f-4063-a85d-6488745b29db/classify/iterations/Iteration6/url';
// const COLOR_API_URL = API_SERVER_URL + '/customvision/v3.0/Prediction/254bb5d1-02f0-4fac-a320-993db2b14713/classify/iterations/Iteration2/url';  // old
const COLOR_API_URL = 'https://wevision-prediction.cognitiveservices.azure.com/customvision/v3.0/Prediction/68699560-e244-480b-bbb4-78a55fbf6267/classify/iterations/ColorRecog/url'
const COLOR_API_PREDICTION_KEY = '66af57421ee24b9a96d26066408e18e6';
const OBJECT_API_URL = API_SERVER_URL + '';
const PREDICTION_KEY = '66af57421ee24b9a96d26066408e18e6';

// API Deciscion making
const acceptableProbability = 0.35;

const TAG = GlobalUtils.TAG;

const CashTagName = Object.freeze({
  NOTE_10:'$10-note',
  NOTE_100:'$100-note',
  NOTE_1000:'$1000-note',
  COIN_2:'$2-coin-testonly',
  NOTE_20:'$20-note',
  COIN_5:'$5-coin-testonly',
  NOTE_50:'$50-note',
  NOTE_500:'$500-note',
});

const ColorTagName = Object.freeze({
  Black:'black',
  White:'white',
  Red:'red',
  Lime:'lime',
  Blue:'blue',
  Yellow:'yellow',
  Cyan:'cyan',
  Magenta:'magenta',
  Silver:'silver',
  Gray:'gray',
  Maroon:'maroon',
  Olive:'olive',
  Green:'green',
  Purple:'purple',
  Teal:'teal',
  Navy:'navy',
});

export default class CustomAPIUtils {

  static scanShortTextLoopMilliSecond = 5000;
  static scanColorLoopMilliSecond = 5000;

  // BBL TODO:
  static currentAPI = ''; // Stop operation wehn currentAPI != operating API

  // BBL TODO: tmp result, prevent TTS if new result is the same as current result (Only for Short Text API)
  static tmpAPIResult: String = '';

  static APIItem = Object.freeze({
    DOCUMENT_RECOGNITION: 1,
    SHORT_TEXT_RECOGNITION: 2,
    VIDEO_CALL: 3,
    VOLUNTEER: 4,
    CASH_RECOGNITION: 5,
    COLOR_RECOGNITION: 6,
    OBJECT_RECOGNITION: 7,
  });

  static APIAction = Object.freeze({
    NONE: 1,
    SCANNING: 2,    // Short text, color, object
    PROCESSING: 3,  // Cash
    RESULT_RETURNED: 4,
    SCANNING_STOPPED: 5,
  });

  static serverPost = (url, key, data, success, error) => {
    axios({
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Prediction-Key': key },
      url: url,
      data: JSON.stringify(data),
    })
    .then(function(res) {
      success(res);
    })
    .catch(function(err) {
      error(err);
    });
  };

  static decodeAPIResult = (res) => {
    let predictions = GlobalUtils.getValueFromObject(res, 'predictions', []);
    let tagName = null;
    let highestProbability = 0;
    predictions.map((item, index) => {
      let probability = GlobalUtils.getValueFromObject(item, 'probability', 0);
      if ((probability > acceptableProbability) && (probability > highestProbability)) {
        tagName = GlobalUtils.getValueFromObject(item, 'tagName', null);
        highestProbability = probability
      }
    });
    return tagName;
  };

  static tranlsateResult = (res, apiItem) => {
    let result = res;
    let localeObj = LocaleUtils.localizedObj();
    switch (apiItem) {
      case CustomAPIUtils.APIItem.CASH_RECOGNITION: {
        let lowercaseRes = res.toLowerCase();
        console.log(TAG + 'CustomAPI lowercaseRes:' + lowercaseRes);
        switch (lowercaseRes) {
          case CashTagName.COIN_2:
            result = localeObj.TXT_API_Cash_2_Coin;
            break;
          case CashTagName.COIN_5:
            result = localeObj.TXT_API_Cash_5_Coin;
            break;
          case CashTagName.NOTE_10:
            result = localeObj.TXT_API_Cash_10_Note;
            break;
          case CashTagName.NOTE_20:
            result = localeObj.TXT_API_Cash_20_Note;
            break;
          case CashTagName.NOTE_50:
            result = localeObj.TXT_API_Cash_50_Note;
            break;
          case CashTagName.NOTE_100:
            result = localeObj.TXT_API_Cash_100_Note;
            break;
          case CashTagName.NOTE_500:
            result = localeObj.TXT_API_Cash_500_Note;
            break;
          case CashTagName.NOTE_1000:
            result = localeObj.TXT_API_Cash_1000_Note;
            break;
        }
        break;
      }
      case CustomAPIUtils.APIItem.COLOR_RECOGNITION: {
        let lowercaseRes = res.toLowerCase();
        console.log(TAG + 'CustomAPI lowercaseRes:' + lowercaseRes);
        switch (lowercaseRes) {
          case ColorTagName.Black:
            result = localeObj.TXT_API_Color_Black;
            break;
          case ColorTagName.White:
            result = localeObj.TXT_API_Color_White;
            break;
          case ColorTagName.Red:
            result = localeObj.TXT_API_Color_Red;
            break;
          case ColorTagName.Lime:
            result = localeObj.TXT_API_Color_Lime;
            break;
          case ColorTagName.Blue:
            result = localeObj.TXT_API_Color_Blue;
            break;
          case ColorTagName.Yellow:
            result = localeObj.TXT_API_Color_Yellow;
            break;
          case ColorTagName.Cyan:
            result = localeObj.TXT_API_Color_Cyan;
            break;
          case ColorTagName.Magenta:
            result = localeObj.TXT_API_Color_Magenta;
            break;
          case ColorTagName.Silver:
            result = localeObj.TXT_API_Color_Silver;
            break;
          case ColorTagName.Gray:
            result = localeObj.TXT_API_Color_Gray;
            break;
          case ColorTagName.Maroon:
            result = localeObj.TXT_API_Color_Maroon;
            break;
          case ColorTagName.Olive:
            result = localeObj.TXT_API_Color_Olive;
            break;
          case ColorTagName.Green:
            result = localeObj.TXT_API_Color_Green;
            break;
          case ColorTagName.Purple:
            result = localeObj.TXT_API_Color_Purple;
            break;
          case ColorTagName.Teal:
            result = localeObj.TXT_API_Color_Teal;
            break;
          case ColorTagName.Navy:
            result = localeObj.TXT_API_Color_Navy;
            break;
        }
        break;
      }
    }
    return result;
  }

  static uploadImage = (apiItem: CustomAPIUtils.APIItem, base64Data, success, failure, error) => {
    let uploadItemType = FireStorageUtils.UploadItemType.IMAGE_CASH;
    switch (apiItem) {
      case CustomAPIUtils.APIItem.CASH_RECOGNITION:
        uploadItemType = FireStorageUtils.UploadItemType.IMAGE_CASH;
        break;
      case CustomAPIUtils.APIItem.COLOR_RECOGNITION:
        uploadItemType = FireStorageUtils.UploadItemType.IMAGE_COLOR;
        break;
      case CustomAPIUtils.APIItem.OBJECT_RECOGNITION:
        // uploadItemType = FireStorageUtils.UploadItemType.IMAGE_CASH;
        break;
      default:
        return;
    }
    FireStorageUtils.uploadItemToGCS(base64Data, uploadItemType,
      () => {},
      () => {},
      fileUrl => {
        console.log(TAG + 'CustomAPI fileUrl:' + fileUrl);
        var url = '';
        var key = PREDICTION_KEY;
        switch (apiItem) {
          case CustomAPIUtils.APIItem.CASH_RECOGNITION:
            url = CASH_API_URL;
            break;
          case CustomAPIUtils.APIItem.COLOR_RECOGNITION:
            url = COLOR_API_URL;
            key = COLOR_API_PREDICTION_KEY;
            break;
          case CustomAPIUtils.APIItem.OBJECT_RECOGNITION:
            url = OBJECT_API_URL;
            break;
          default:
            return;
        }
        let input = {
          'Url': fileUrl,
        };
        CustomAPIUtils.serverPost(
          url,
          key,
          input,
          (res) => {
            console.log(TAG + 'CustomAPI success:' + JSON.stringify(res.data));
            let tagName = CustomAPIUtils.decodeAPIResult(res.data);
            console.log(TAG + 'CustomAPI tagName:' + tagName);
            if (tagName != null) {
              let tranlsatedTagName = this.tranlsateResult(tagName, apiItem);
              console.log(TAG + 'CustomAPI tranlsatedTagName:' + tranlsatedTagName);
              success(tranlsatedTagName);
            } else {
              success(LocaleUtils.localizedObj().TXT_API_RECOGNITION_FAIL);
            }
          },
          (err) => {
            console.log(TAG + 'CustomAPI error:' + err);
            error(err);
          }
        );

      },
    );
  };

  static callCustomAPI = async (apiItem: CustomAPIUtils.APIItem, imageUri, base64Data, success, failure, error) => {
    if (imageUri == null) {
      console.log(GlobalUtils.TAG, 'Glasses base64Data');
      CustomAPIUtils.uploadImage(apiItem, base64Data, success, failure, error);
    } else {
      let resizedBase64 = await PhotoUtils.getResizeImageWithBase64(imageUri);
      if (resizedBase64 == null) {
        console.log(GlobalUtils.TAG, 'resizeBase64 is null');
        if (base64Data != null) {
          CustomAPIUtils.uploadImage(apiItem, base64Data, success, failure, error);
        }
      } else {
        console.log(GlobalUtils.TAG, 'resizeBase64');
        CustomAPIUtils.uploadImage(apiItem, resizedBase64, success, failure, error);
      }
    }
  }

  static isTTSCanPlayAPIResult = (result) => {
    let isTTSCanPlay = true;
    if (CustomAPIUtils.tmpAPIResult !== '') {
      if (result === CustomAPIUtils.tmpAPIResult) {
        isTTSCanPlay = false;
      }
    }
    // console.log(GlobalUtils.TAG, 'ShortText isTTSCanPlay:' + isTTSCanPlay);
    CustomAPIUtils.tmpAPIResult = result;
    return isTTSCanPlay;
  }
}
