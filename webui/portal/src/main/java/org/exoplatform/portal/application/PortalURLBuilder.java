/**
 * Copyright (C) 2009 eXo Platform SAS.
 * 
 * This is free software; you can redistribute it and/or modify it
 * under the terms of the GNU Lesser General Public License as
 * published by the Free Software Foundation; either version 2.1 of
 * the License, or (at your option) any later version.
 * 
 * This software is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Lesser General Public License for more details.
 * 
 * You should have received a copy of the GNU Lesser General Public
 * License along with this software; if not, write to the Free
 * Software Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA
 * 02110-1301 USA, or see the FSF site: http://www.fsf.org.
 */

package org.exoplatform.portal.application;

import org.exoplatform.web.application.Parameter;
import org.exoplatform.web.application.URLBuilder;
import org.exoplatform.webui.core.UIComponent;

import java.net.URLEncoder;

/**
 * Created by The eXo Platform SAS
 * Apr 3, 2007  
 */
public class PortalURLBuilder extends URLBuilder<UIComponent>
{

   public PortalURLBuilder(String baseURL)
   {
      super(baseURL);
   }

   @SuppressWarnings("unused")
   public String createURL(String action, Parameter[] params)
   {
      return null;
   }

   @SuppressWarnings("unused")
   public String createURL(String action, String objectId, Parameter[] params)
   {
      return null;
   }

   protected void createURL(StringBuilder builder, UIComponent targetComponent, String action, String targetBeanId,
      Parameter[] params)
   {
      builder.append(getBaseURL()).append("?").append(PortalRequestContext.UI_COMPONENT_ID).append('=').append(
         targetComponent.getId());
      if (action != null && action.trim().length() > 0)
      {
         builder.append("&amp;").append(PortalRequestContext.UI_COMPONENT_ACTION).append('=').append(action);
      }

      if (targetBeanId != null && targetBeanId.trim().length() > 0)
      {
         builder.append("&amp;").append(UIComponent.OBJECTID).append('=').append(targetBeanId);
      }

      if (params == null || params.length < 1)
         return;
      for (Parameter param : params)
      {
         try
         {
            param.setValue(URLEncoder.encode(param.getValue(), "utf-8"));
         }
         catch (Exception e)
         {
            System.err.println(e.toString());
         }
         builder.append("&amp;").append(param.getName()).append('=').append(param.getValue());
      }

   }

}
