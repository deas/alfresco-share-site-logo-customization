/**
 * SiteLogo tool component.
 * 
 * @namespace Alfresco
 * @class Alfresco.SiteLogo
 */
(function()
{
   /**
    * YUI Library aliases
    */
   var Dom = YAHOO.util.Dom,
       Event = YAHOO.util.Event,
       Element = YAHOO.util.Element;
   
   /**
    * Alfresco Slingshot aliases
    */
   var $html = Alfresco.util.encodeHTML;

   var site;
   
   /**
    * SiteLogo constructor.
    * 
    * @param {String} htmlId The HTML id �of the parent element
    * @return {Alfresco.SiteLogo} The new SiteLogo instance
    * @constructor
    */
   Alfresco.SiteLogo = function(htmlId)
   {
      this.name = "Alfresco.SiteLogo";
      Alfresco.SiteLogo.superclass.constructor.call(this, htmlId);
      
      /* Register this component */
      Alfresco.util.ComponentManager.register(this);
      
      /* Load YUI Components */
      Alfresco.util.YUILoaderHelper.require(["button", "container", "json", "history"], this.onComponentsLoaded, this);
      
      /* Define panel handlers */
      var parent = this;
      
      // NOTE: the panel registered first is considered the "default" view and is displayed first
      
      /* Options Panel Handler */
      OptionsPanelHandler = function OptionsPanelHandler_constructor()
      {
         OptionsPanelHandler.superclass.constructor.call(this, "options");
      };
      
      YAHOO.extend(OptionsPanelHandler, Alfresco.ConsolePanelHandler,
      {
         /**
          * Called by the ConsolePanelHandler when this panel shall be loaded
          *
          * @method onLoad
          */
         onLoad: function onLoad()
         {
            // Buttons
            parent.widgets.applyButton = Alfresco.util.createYUIButton(parent, "apply-button", null,
            {
               type: "submit"
            });
            parent.widgets.upload = Alfresco.util.createYUIButton(parent, "upload-button", this.onUpload);
            parent.widgets.reset = Alfresco.util.createYUIButton(parent, "reset-button", this.onReset);
            
            // Form definition
            var form = new Alfresco.forms.Form(parent.id + "-options-form");
            form.setSubmitElements([parent.widgets.applyButton]);
            form.setSubmitAsJSON(true);
            form.setAJAXSubmit(true,
            {
               successCallback:
               {
                  fn: this.onSuccess,
                  scope: this
               }
            });
            form.init();
         },
         
         /**
          * Successfully applied options event handler
          *
          * @method onSuccess
          * @param response {object} Server response object
          */
         onSuccess: function OptionsPanel_onSuccess(response)
         {
            if (response && response.json)
            {
               if (response.json.success)
               {
                  // refresh the browser to force the themed components to reload
                  window.location.reload(true);
               }
               else if (response.json.message)
               {
                  Alfresco.util.PopupManager.displayPrompt(
                  {
                     text: response.json.message
                  });
               }
            }
            else
            {
               Alfresco.util.PopupManager.displayPrompt(
               {
                  text: Alfresco.util.message("message.failure")
               });
            }
         },
         
         /**
          * Upload button click handler
          *
          * @method onUpload
          * @param e {object} DomEvent
          * @param p_obj {object} Object passed back from addListener method
          */
         onUpload: function OptionsPanel_onUpload(e, p_obj)
         {
            if (!this.fileUpload)
            {
               this.fileUpload = Alfresco.getFileUploadInstance();
            }
            
            // Show uploader for single file select - override the upload URL to use appropriate upload service
            var uploadConfig =
            {
			   flashUploadURL: "/api/site-logo/site/" + parent.options.siteId,
               htmlUploadURL: "/api/site-logo/site/" + parent.options.siteId + ".html",
			   
               mode: this.fileUpload.MODE_SINGLE_UPLOAD,
               onFileUploadComplete:
               {
                  fn: this.onFileUploadComplete,
                  scope: this
               }
            };
            this.fileUpload.show(uploadConfig);
            Event.preventDefault(e);
         },
         
         /**
          * Reset button click handler
          *
          * @method onReset
          * @param e {object} DomEvent
          * @param p_obj {object} Object passed back from addListener method
          */
         onReset: function OptionsPanel_onReset(e, p_obj)
         {
            // replace logo image URL with the default one
            var logoImg = Dom.get(this.id + "-logoimg");
            logoImg.src = parent.options.defaultlogo;
            
            // set 'reset' value in hidden field ready for options form submit
            Dom.get("site-options-logo").value = "reset";
         }
      });
      new OptionsPanelHandler();
      
      return this;
   };
   
   YAHOO.extend(Alfresco.SiteLogo, Alfresco.ConsoleTool,
   {
      /**
       * File Upload complete event handler
       *
       * @method onFileUploadComplete
       * @param complete {object} Object literal containing details of successful and failed uploads
       */
      onFileUploadComplete: function onFileUploadComplete(complete)
      {
         var success = complete.successful.length;
         if (success != 0)
         {
            var noderef = complete.successful[0].nodeRef;
            
            // replace image URL with the updated one
            var logoImg = Dom.get(this.id + "-logoimg");
            logoImg.src = Alfresco.constants.PROXY_URI + "api/node/" + noderef.replace("://", "/") + "/content";
            
            // set noderef value in hidden field ready for options form submit
            Dom.get("site-options-logo").value = noderef;
         }
      }
   });
})();