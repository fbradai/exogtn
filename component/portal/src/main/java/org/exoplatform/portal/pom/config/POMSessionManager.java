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

package org.exoplatform.portal.pom.config;

import org.exoplatform.commons.chromattic.ChromatticLifeCycle;
import org.exoplatform.commons.chromattic.ChromatticManager;
import org.exoplatform.commons.chromattic.SessionContext;
import org.exoplatform.portal.pom.config.cache.DataCache;
import org.exoplatform.portal.pom.config.cache.PortalNamesCache;
import org.exoplatform.services.cache.CacheService;
import org.exoplatform.services.cache.ExoCache;
import org.exoplatform.services.jcr.RepositoryService;
import org.gatein.common.logging.Logger;
import org.gatein.common.logging.LoggerFactory;
import org.gatein.mop.core.api.MOPService;
import org.picocontainer.Startable;

import java.io.Serializable;
import java.lang.reflect.UndeclaredThrowableException;

/**
 * @author <a href="mailto:julien.viet@exoplatform.com">Julien Viet</a>
 * @version $Revision$
 */
public class POMSessionManager implements Startable
{

   /** . */
   private final Logger log = LoggerFactory.getLogger(POMSessionManager.class);

   /** . */
   private MOPService pomService;

   /** . */
   private final ExoCache<GlobalKey, Object> cache;

   /** . */
   final ChromatticManager manager;

   /** . */
   private ChromatticLifeCycle configurator;

   /** . */
   private final TaskExecutionDecorator executor;

   /** . */
   private final RepositoryService repositoryService;

   public POMSessionManager(RepositoryService repositoryService, ChromatticManager manager, CacheService cacheService)
   {
      //
      this.repositoryService = repositoryService;
      this.manager = manager;
      this.cache = cacheService.getCacheInstance("MOPSessionManager");
      this.pomService = null;
      this.executor = new PortalNamesCache(new DataCache(new ExecutorDispatcher()));
   }

   public void cachePut(Serializable key, Object value)
   {
      GlobalKey globalKey = GlobalKey.wrap(configurator.getRepositoryName(), key);

      //
      if (log.isTraceEnabled())
      {
         log.trace("Updating cache key=" + globalKey + " with value=" + value);
      }

      //
      cache.put(globalKey, value);
   }

   public Object cacheGet(Serializable key)
   {
      GlobalKey globalKey = GlobalKey.wrap(configurator.getRepositoryName(), key);

      //
      Object value = cache.get(globalKey);

      //
      if (log.isTraceEnabled())
      {
         log.trace("Obtained for cache key=" + globalKey + " value=" + value);
      }

      //
      return value;
   }

   public void cacheRemove(Serializable key)
   {
      GlobalKey globalKey = GlobalKey.wrap(configurator.getRepositoryName(), key);

      //
      if (log.isTraceEnabled())
      {
         log.trace("Removing cache key=" + globalKey);
      }

      //
      cache.remove(globalKey);
   }

   public void start()
   {
      try
      {
         MOPChromatticLifeCycle configurator = (MOPChromatticLifeCycle)manager.getLifeCycle("mop");
         configurator.manager = this;

         //
         PortalMOPService pomService = new PortalMOPService(configurator.getChromattic());
         pomService.start();

         //
         this.pomService = pomService;
         this.configurator = configurator;
      }
      catch (Exception e)
      {
         throw new UndeclaredThrowableException(e);
      }
   }

   public void stop()
   {
   }

   public void clearCache()
   {
      if (log.isTraceEnabled())
      {
         log.trace("Clearing cache");
      }

      //
      cache.clearCache();
   }

   public MOPService getPOMService()
   {
      return pomService;
   }

   public <E extends TaskExecutionDecorator> E getDecorator(Class<E> decoratorClass)
   {
      return executor.getDecorator(decoratorClass);
   }

   /**
    * <p>Returns the session currently associated with the current thread of execution.</p>
    *
    * @return the current session
    */
   public POMSession getSession()
   {
      SessionContext context = configurator.getContext();
      return context != null ? (POMSession)context.getAttachment("mopsession") : null;
   }

   /**
    * <p>Open and returns a session to the model. When the current thread is already associated with a previously opened
    * session the method will throw an <tt>IllegalStateException</tt>.</p>
    *
    * @return a session to the model.
    */
   public POMSession openSession()
   {
      SessionContext context = configurator.openContext();
      return (POMSession)context.getAttachment("mopsession");
   }

   /**
    * <p>Execute the task with a session.</p>
    *
    * @param task the task to execute
    * @throws Exception any exception thrown by the task
    * @return the value
    */
   public <V> V execute(POMTask<V> task) throws Exception
   {
      POMSession session = getSession();

      //
      return executor.execute(session, task);
   }

}
