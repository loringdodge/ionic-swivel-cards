(function(ionic) {

  /***********************************
   * Get transform origin poly
   ***********************************/
  var d = document.createElement('div');
  var transformKeys = ['webkitTransformOrigin', 'transform-origin', '-webkit-transform-origin', 'webkit-transform-origin',
              '-moz-transform-origin', 'moz-transform-origin', 'MozTransformOrigin', 'mozTransformOrigin'];

  var TRANSFORM_ORIGIN = 'webkitTransformOrigin';
  for(var i = 0; i < transformKeys.length; i++) {
    if(d.style[transformKeys[i]] !== undefined) {
      TRANSFORM_ORIGIN = transformKeys[i];
      break;
    }
  }

  var transitionKeys = ['webkitTransition', 'transition', '-webkit-transition', 'webkit-transition',
              '-moz-transition', 'moz-transition', 'MozTransition', 'mozTransition'];
  var TRANSITION = 'webkitTransition';
  for(var i = 0; i < transitionKeys.length; i++) {
    if(d.style[transitionKeys[i]] !== undefined) {
      TRANSITION = transitionKeys[i];
      break;
    }
  }

  console.log(ionic.views.View.inherit);

  /***********************************
   * Item View
   ***********************************/
  var PivotCardView = ionic.views.View.inherit({

    /***************
     * Initialize
     ***************/

    // Initialize a card with the given options.
    initialize: function(opts) {
      opts = ionic.extend({
      }, opts);

      ionic.extend(this, opts);

      this.el = opts.el;

    },

    /***************
     * Utils
     ***************/

    setZindex: function(value, element) {
      var element = element || this.el;
      element.style.zIndex = element.style.webkitzIndex = value;
    },

    setTransform: function(value) {
      var element = element || this.el;
      element.style.transform = element.style.webkitTransform = value;
    },

    setOpacity: function(value, element) {
      var element = element || this.el;
      element.style.opacity = element.style.webkitOpacity = value;
    },

    setBoxShadow: function(value) {
      var element = element || this.el;
      element.style.boxShadow = element.style.webkitBoxShadow = value;
    },

    setTransition: function(value) {
      var element = element || this.el;
      element.style.transition = element.style.webkitTransition = value;
    },

    setTransformOrigin: function(value) {
      var element = element || this.el;
      element.style.transformOrigin = element.style.webkitTransformOrigin = value;
    },

    setPerspectiveOrigin: function(value) {
      var element = element || this.el;
      element.parentNode.style.perspectiveOrigin = element.parentNode.style.webkitPerspectiveOrigin = value;
    },

    calculateBoxShadow: function(index) {
      return (0.5 + (index / 20));
    },

    calculateOpacity: function(index) {
      return (0 + (index / 6));
    },

    calculateScale: function(index) {
      return Math.max(0, (1 - (index / 10)));
    },

    calculateTranslateX: function(index) {
      return (index * this.spacing);
    },

    /***************
     * Animations
     ***************/

    // Swoosh the card away
    animateSwivel: function(index) {

      var self = this;

      var card = this.el;

      var animation = collide.animation({
        duration: 2000,
        percent: 0,
        reverse: false
      })

      .on('start', function() {
        console.log("pos: " + self.rotationPosition + ", rot:" + self.rotation)
      })

      .easing({
        type: 'spring',
        frequency: 5,
        friction: 250,
        initialForce: false
      })

      .on('step', function(v) {
        self.setTransform('rotateY(' + (self.rotationPosition - (self.rotation*v)) + 'deg)');
      })

      .on('complete', function() {
        self.rotationPosition = self.rotationPosition - self.rotation;
      })
      .start();

    },
  });


  /***********************************
   * Gallery View
   ***********************************/

  var Queue = ionic.views.View.inherit({

    initialize: function(arr) {
      this.arr = arr;
    },

    enqueue: function(item) {
      this.arr.push(item);
    },

    dequeue: function() {
      return this.arr.shift();
    },

    getQueue: function() {
      return this.arr;
    }

  });

  var PivotCardsCollection = ionic.views.View.inherit({

    /***************
     * Initialize
     ***************/

    // Initialize a card with the given options.
    initialize: function(opts) {

      opts = ionic.extend({
      }, opts);

      ionic.extend(this, opts);

      this.shownArray = [];
      this.hiddenArray = [];

    },

    positionCard: function(card) {
      card.pivotCard.rotation = 20;
      card.pivotCard.rotationPosition = 80;
      card.pivotCard.setZindex(5);
      card.pivotCard.setTransformOrigin('right');
      card.pivotCard.setTransform('rotateY(' + 80 + 'deg)');
    },

    addCard: function(card) {
      this.positionCard(card);
    },

    removeCard: function(card) {
      card.pivotCard.setTransform('rotateY(' + 180 + 'deg)');
    },

    queueCard: function(card) {

    },

    dequeueCard: function(card) {

    },

    // Sort the cards initially and apply the appropriate animations
    sortCards: function($timeout) {

      var existingCards = this.collection;

      this.shownArray = new Queue(this.collection.splice(0,6));
      this.hiddenArray = new Queue(this.collection);

      var shownArray = this.shownArray.getQueue();

      for(i = 0; i < shownArray.length; i++) {

        if(!shownArray[i]) continue;

        (function(j) {
          $timeout(function() {
            var rotation = 20;

            shownArray[j].pivotCard.rotation = rotation;
            shownArray[j].pivotCard.rotationPosition = (-20 + (rotation * j));

            shownArray[j].pivotCard.setZindex(j);
            shownArray[j].pivotCard.setTransformOrigin('right');
            shownArray[j].pivotCard.setTransform('rotateY(' + shownArray[j].pivotCard.rotationPosition + 'deg)');

          }, 100 * j);
        })(i);

      }
    },

    // Move the cards forward (after a card has been destroyed)
    swivelCards: function ($timeout) {

      var existingCards = this.shownArray.getQueue();

      console.log(existingCards);

      for(var i = 0; i < existingCards.length; i++){

        if(i === 0) {
          this.removeCard(existingCards[i]);
          continue;
        }

        (function(j) {
          $timeout(function() {
            existingCards[j].pivotCard.setZindex(j);
            existingCards[j].pivotCard.animateSwivel(j);
          }.bind(this), 100 * j);
        }.bind(this))(i);

      }

      $timeout(function() {
        var enqueueItem = this.hiddenArray.dequeue();
        var dequeueItem = this.shownArray.dequeue();
        this.hiddenArray.enqueue(dequeueItem);
        this.addCard(enqueueItem);
        this.shownArray.enqueue(enqueueItem);
      }.bind(this), 100 * i);

    }


  });

  /***********************************
   * Pivot Card Directive (singular)
   ***********************************/
  angular.module('ionic.pivot.cards', ['ionic'])

  .directive('pivotCard', ['$timeout', function($timeout) {

    return {
      restrict: 'E',
      template: '<div class="pivot-reach"><div class="pivot-content" ng-transclude></div></div>',
      require: '^pivotCards',
      transclude: true,

      scope: {

      },

      controller: ['$scope', '$element', function($scope, $element) {

        var el = $element[0];

        // Force hardware acceleration for animation - better performance on first touch
        el.style.transform = el.style.webkitTransform = 'translate3d(0px, 0px, 0px)';

      }],
    }
  }])

  /***************************************
   * Pivot Cards Directive (collection)
   ***************************************/
  .directive('pivotCards', ['$rootScope', '$timeout', function($rootScope, $timeout) {

    return {
      restrict: 'E',
      template: '<div class="pivot-cards" ng-transclude></div>',
      transclude: true,
      scope: {

      },
      controller: ['$scope', '$element', '$timeout', function($scope, $element, $timeout) {

        // Instantiate a new card collection
        var pivotCardsCollection = new PivotCardsCollection({
          collection: []
        });

        $timeout(function() {

          // Query for all of the cards
          var cards = $element[0].querySelectorAll('pivot-card');

          var pane = document.getElementsByClassName('pane')[0];

          var button = document.getElementsByClassName('trigger-card')[0];

          // Loop through the cards and instantiate a new SwipeableCardView
          for(var i = 0; i < cards.length; i++){
            cards[i].pivotCard = new PivotCardView({
              el: cards[i],
              collection: pivotCardsCollection
            })

            pivotCardsCollection.collection.push(cards[i]);
          }

          $timeout(function() {
            button.addEventListener('click', function(e){
              pivotCardsCollection.swivelCards($timeout);
            });
          });

          pane.style.perspectiveOrigin = pane.style.webkitPerspectiveOrigin = 'right';
          pane.parentNode.style.perspective = pane.style.webkitPerspective = '2000px';

          // Sort the cards and display them at specified intervals
          pivotCardsCollection.sortCards($timeout);

        });
      }]
    }
  }])

})(window.ionic);
