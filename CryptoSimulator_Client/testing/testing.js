var assert = require('assert');

describe('getDate integrity test', function() {
  describe('#getDate()', function() {
    it('should return "" when the value is null', function() {
      assert.equal(getDate(null), "");
    });
  });
});

describe('getDate result test', function() {
    describe('#getDate()', function() {
      it('should return "Thursday 4 Feb 2021" when the value is 1612432029322', function() {
        assert.equal(getDate(1612432029322), "Thursday 4 Feb 2021");
      });
    });
});

describe('parsePrice integrity test 1', function() {
    describe('#parsePrice()', function() {
      it('should return "" when the value is null', function() {
        assert.equal(parsePrice(null), "");
      });
    });
});

describe('parsePrice integrity test 2', function() {
    describe('#parsePrice()', function() {
      it('should return "" when the value is not a number', function() {
        assert.equal(parsePrice(null), "");
      });
    });
});

describe('parsePrice result test', function() {
    describe('#parsePrice()', function() {
      it('should return "1.679,76$" when the value is 1679.76', function() {
        assert.equal(parsePrice(1679.76), "1.679,76$");
      });
    });
});

describe('isEquivalent integrity test 1', function() {
    describe('#isEquivalent()', function() {
      it('should return false when at leat one argument is null', function() {
        assert.equal(isEquivalent(null, {"a": 3, "b": [1,2,3]}), false);
      });
    });
});

describe('isEquivalent integrity test 1', function() {
    describe('#isEquivalent()', function() {
      it('should return false when at leat one argument is not a dictionary', function() {
        assert.equal(isEquivalent("not_a_dictionary", {"a": 3, "b": [1,2,3]}), false);
      });
    });
});

describe('isEquivalent result test 1', function() {
    describe('#isEquivalent()', function() {
      it('should return true if the arguments are equals', function() {
        assert.equal(isEquivalent({"a": 3, "b": 2}, {"a": 3, "b": 2}), true);
      });
    });
});


describe('isEquivalent result test 2', function() {
    describe('#isEquivalent()', function() {
      it('should return false if the arguments are not equals', function() {
        assert.equal(isEquivalent({"a": 3, "b": 1}, {"a": 3, "b": 2}), false);
      });
    });
});


var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
var months = ["Gen", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function getDate(timestamp){
    if(timestamp == null || timestamp == ""){
        return "";
    }
    var date = new Date(timestamp);
    var textDate = days[date.getDay()] + " " + date.getDate() + " " + months[date.getMonth()] + " " + date.getFullYear();
    return textDate;
}

function parsePrice(price){
    if(price == null || typeof(price) != "number"){
        return "";
    }
    price = price.toFixed(2);
    var integer = String(Math.trunc(price));
    var decimal = price.split(".")[1];
    if(integer.length > 3){
        integer = [integer.slice(0, (integer.length - 3)), ".", integer.slice((integer.length - 3))].join('');
    }
    return integer + "," + decimal + "$";
}

function isEquivalent(a, b) {
    if(a == null || b == null){
        return false;
    }

    var aProps = Object.getOwnPropertyNames(a);
    var bProps = Object.getOwnPropertyNames(b);
  
    if (aProps.length != bProps.length) {
        return false;
    }
  
    for (var i = 0; i < aProps.length; i++) {
        var propName = aProps[i];
        if (a[propName] !== b[propName]) {
            return false;
        }
    }
    return true;
}