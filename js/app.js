var App = Ember.Application.create({
  ready: function(){
    console.log('ready');
    App.turnstileManager = App.TurnstileManager.create({
      enableLogging: true
    });
  }
});

App.Router.map(function() {
  // put your routes here
});

App.IndexRoute = Ember.Route.extend({
  events: {
    coin: function( controller ){
      console.log('coin action');
      App.turnstileManager.send( 'coin', { controller: controller } );
    },

    push: function( controller ){
      console.log('push action');
      App.turnstileManager.send( 'push', { controller: controller } );
    }
  }
});

App.IndexController = Ember.Controller.extend({
  totalCoins: 0,

  currentState: 'locked',

  returnCoin: function(){
    alert('Please take your coin');
  }
});

App.BaseState = Ember.State.extend({
  unhandledEvent: function( manager, eventName ) {
    console.log( manager.toString() + ': unhandledEvent with name ' + eventName );
  },

  enter: function( manager ){
    console.log('entering');
  },

  setup: function( manager, context ){
    console.log('setup');
    if( context && context.controller ){
      context.controller.set( 'currentState', manager.get('currentState.name') );
    }
  },

  exit: function( manager ){
    console.log('exiting');
  }
});

App.TurnstileManager =  Ember.StateManager.extend({
  initialState: 'locked',

  locked: App.BaseState.extend({
    coin: function( manager, context ){
      console.log('Thanks for the coin :)');
      context.controller.incrementProperty('totalCoins');
      manager.set('context', context);
      manager.transitionTo( 'unlocked', context );
    },

    push: function( manager, context ){
      console.log('Sorry, coin required to pass through the turnstile.');
    },

    exit: function( manager ){
      console.log( 'total coins:' + manager.get('context.controller.totalCoins') );
    }
  }),

  unlocked: App.BaseState.extend({
    coin: function( manager, context ){
      console.log('No coin needed, but thanks; try pushing.');
      context.controller.returnCoin();
    },

    push: function( manager, context ){
      console.log('You may pass through the turnstile.');
      manager.transitionTo( 'locked', context );
    }
  })
});
