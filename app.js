
//budget controller
var budgetController = (function(){
    
 var Expense = function(id, description, value){
     this.id = id;
     this.description = description;
     this.value = value;
     this.percentage = -1;
 };

Expense.prototype.calcPercentage = function(totalIncome) {
   if (totalIncome > 0) {
    this.percentage = Math.round((this.value / totalIncome) * 100);
   } else {
     this.percentage = -1;
   }
   
};

Expense.prototype.getPercentage = function() {
   return this.percentage;
};

 var Income = function(id, description, value){
     this.id = id;
     this.description = description;
     this.value = value;
 };

 var calculateTotal = function(type){
     var sum = 0;
     data.allItems[type].forEach(function(current){
     sum += current.value;
     });

     data.totals[type] = sum;
 };

 var data = {
    allItems: {
        exp: [],
        inc: [],
    },

    totals: {
        exp: 0,
        inc: 0
    },
    budget: 0,
    percentage: -1,
 };

 return {
     addItem: function(type, des, val) {
    //declare variables for new Item (expense or income), unique ID for each item
      var newItem, ID;   
    //  create new ID
      if(data.allItems[type].length > 0){
        ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
      } else {
          ID = 0;
      }
    //create new item based on the type selected (inc or exp)  
      if(type === 'exp'){
        newItem = new Expense(ID, des, val);
      } else if (type === 'inc'){
        newItem = new Income(ID, des, val);
         }
    //push new item into our data structure
     data.allItems[type].push(newItem);
    //return the new item
     return newItem;
     },

     deleteItem: function(type, id) {
       var ids, index;
        ids = data.allItems[type].map(function(current){
             return current.id;
        });

        index = ids.indexOf(id);

        if (index !== -1){
          data.allItems[type].splice(index, 1);
        }
     },

     calculateBudget: function(){
         //calculate total income and expenses
           calculateTotal('exp');
           calculateTotal('inc');
         //calculate the budget: income - expenses
           data.budget = data.totals.inc - data.totals.exp;
         //calculate the percentage of income that we spent
         if (data.totals.inc > 0) {
            data.percentage = Math.round( (data.totals.exp / data.totals.inc) * 100 );
         } else {
             data.percentage = -1;
         }
            

         // Expense = 100 and income 200, spent 50%
     },

     calculatePercentages: function() {
       data.allItems.exp.forEach(function(cur) {
          cur.calcPercentage(data.totals.inc);
       });
     },

     getPercentages: function() {
      var allPerc = data.allItems.exp.map(function(cur) {
           return cur.getPercentage();
      });
          return allPerc;
     },

    getBudget: function() {
           return {
               budget: data.budget,
               totalInc: data.totals.inc,
               totalExp: data.totals.exp,
               percentage: data.percentage,
           }
    },

     testing: function() {
         console.log(data);
     }
 };


})();

//UI controller
var UIController = (function() {
  
    var DOMstrings = {
        inputType : '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage',
        };

    
   return {
       getInput: function() {
          return {
            type:document.querySelector(DOMstrings.inputType).value,
            description:document.querySelector(DOMstrings.inputDescription).value,
            value: parseFloat(document.querySelector(DOMstrings.inputValue).value),
        };
    },

       addListItem: function(obj, type) {
           var html, newHtml, element;
           //create HTML string with placeholder text
           if(type === 'inc'){
              element = DOMstrings.incomeContainer;
              html =  '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div><div>';
           } else if (type === 'exp'){
            element = DOMstrings.expensesContainer;
            html = '<div class="item clearfix" id="exp-%id%"> <div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
           }
            
           //replace the placeholder text with some actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', obj.value);
           //insert html page
           
           document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
       },

       deleteListItem: function(selectorID){
         var el = document.getElementById(selectorID);
         el.parentNode.removeChild(el);
           
       },

       clearFields: function() {
         var fields, fieldsArr;
         fields =  document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);

        fieldsArr = Array.prototype.slice.call(fields);

        fieldsArr.forEach(function(current, index, array){
           current.value = "";
        });

        fieldsArr[0].focus();
       },

       displayBudget: function(obj) {
           document.querySelector(DOMstrings.budgetLabel).textContent = obj.budget;
           document.querySelector(DOMstrings.incomeLabel).textContent = obj.totalInc;
           document.querySelector(DOMstrings.expensesLabel).textContent = obj.totalExp;
           
         //% expenses should only display if positive
           if(obj.percentage > 0 ) {
            document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + "%";
           } else {
            document.querySelector(DOMstrings.percentageLabel).textContent = '0';

           }
       },
       displayPercentages: function(percentages) {
         var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);

         var nodeListForEach = function(list, callback) {
            for (var i = 0; i < list.length; i++) {
              callback(list[i], i);
            }
         };

         nodeListForEach(fields, function(current, index) {

          if (percentages[index] > 0){
            current.textContent = percentages[index] + '%';
          } else {
            current.textContent = '---';
          }
             
         });
       },

       getDOMstrings: function() {
           return DOMstrings;
       }
   };

})();

//controller module
var controller = (function(budgetCtrl, UICtrl) {

    var setupEventListeners = function() {
        var DOM = UICtrl.getDOMstrings();
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);
        document.addEventListener('keypress', function(event) {
          if(event.keyCode === 13 || event.which === 13){
            ctrlAddItem();
          }
        });

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
    };

    var updateBudget = function() {
        //calculate the budget
         budgetCtrl.calculateBudget();
        //return the budget
         var budget = budgetCtrl.getBudget();
        //display the budget on the UI
         UICtrl.displayBudget(budget);
    };
    
    var updatePercentages = function() {
     //  calculate percentages
        budgetCtrl.calculatePercentages();
     //read percentages from budget controller
        var percentages = budgetCtrl.getPercentages();
     //update the UI with the new percentages
       UICtrl.displayPercentages(percentages);
    };

    var ctrlAddItem = function() {
        var input, newItem;

        //get inputs from UI
        input = UICtrl.getInput();
        
        //check if input fields are not empty

      if (input.description !== "" && !isNaN(input.value) && input.value > 0)  {
          
         //add item from inputs to the budget controller
       newItem = budgetController.addItem(input.type, input.description, input.value);
       //add the item to the webpage
      UICtrl.addListItem(newItem, input.type);
       //clear the fields
      UICtrl.clearFields();
       //calculate and update budget
       updateBudget();
      //calculate and update percentages
      updatePercentages();
      }
       
    };

    var ctrlDeleteItem = function(event) {
      var itemID, splitID, type, ID;
      itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

      if (itemID) {
        splitID = itemID.split('-');
        type = splitID[0];
        ID = parseInt(sliptID[1]);

        //delete item from datastructure
       budgetCtrl.deleteItem(type, ID);

        //delete item from user interface
       UICtrl.deleteListItem(itemID);
        //update and show the new budget
        updateBudget();
        //calculate and update percentages
        updatePercentages();
      }
        
    };


    return {
        init: function() {
          UICtrl.displayBudget({
            budget: 0,
            totalInc: 0,
            totalExp: 0,
            percentage:0,
          });
          setupEventListeners();
        }
    }
  

})(budgetController, UIController);

controller.init();