/* ==========================================================================
   API Configuration
   ========================================================================== */
// Dynamic API URL based on the environment
const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:3000' 
  : 'https://your-glitch-project-name.glitch.me';  

/* ==========================================================================
   Global Handlebars Helper Registrations
   ========================================================================== */
// Before the DOMContentLoaded event
Handlebars.registerHelper('isEven', function(index) {
  return index % 2 === 0;
});

Handlebars.registerHelper('add', function(a, b) {
    return parseInt(a) + parseInt(b);
});

// Register Handlebars helper to compare values
Handlebars.registerHelper('eq', function(a, b) {
  return a === b;
});

// Add this with your other Handlebars helpers
Handlebars.registerHelper('splitParagraphs', function(text) {
    if (!text) return [];
    return text.split('\n\n').filter(p => p.trim());
});

/* ==========================================================================
   Global Utility Functions
   ========================================================================== */
// Function to check API availability
async function checkApiConnection() {
    try {
        const response = await fetch(`${API_URL}/api/event-details`);
        if (!response.ok) throw new Error('API not responding');
        return true;
    } catch (error) {
        console.error('API Connection Error:', error);
        return false;
    }
}

// Function to navigate to the analysis page for a given event
function navigateToAnalysis(eventId) {
    const loadingEl = document.getElementById("loading");
    if (loadingEl) {
        loadingEl.classList.remove("hidden");
    }
    window.location.href = `analysis.html?event=${eventId}`;
}

// Helper function to render a Handlebars template to a specific container.
function renderTemplate(templateId, data, containerId) {
  const templateSource = document.getElementById(templateId).innerHTML;
  const template = Handlebars.compile(templateSource);
  const html = template(data);
  document.getElementById(containerId).innerHTML = html;
}

/* ==========================================================================
   Main DOMContentLoaded Event
   ========================================================================== */
document.addEventListener("DOMContentLoaded", () => {

    /* -----------------------------
       Show Loading Spinner
       ----------------------------- */
    const loadingEl = document.getElementById("loading");
    if (loadingEl) {
      loadingEl.classList.remove("hidden");
    }
  
    /* -----------------------------
       Smooth Scrolling for Anchor Links
       ----------------------------- */
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener("click", function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute("href"));
        if (target) target.scrollIntoView({ behavior: "smooth" });
      });
    });
  
    /* -----------------------------
       Handlebars Helper Registrations (Inside DOMContentLoaded)
       ----------------------------- */
    Handlebars.registerHelper("truncate", (text, length) => {
      return text.length > length ? text.substring(0, length) + "..." : text;
    });

    // Update the formatDate helper
    Handlebars.registerHelper('formatDate', function(date) {
        if (!date) return 'Date not available';
        try {
            return new Date(date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch (e) {
            return date; // Return original string if date parsing fails
        }
    });

    /* -----------------------------
       Analysis Page Functionality
       ----------------------------- */
    // Only initialize analysis page functionality if we're on the analysis page
    if (document.getElementById('analysis-content')) {
        let currentEventId = null;
        const analysisContent = document.getElementById('analysis-content');
        const eventMenu = document.getElementById('event-menu');
        
        // Compile templates for the analysis page
        const menuTemplate = Handlebars.compile(
            document.getElementById('event-menu-template').innerHTML
        );
        const analysisTemplate = Handlebars.compile(
            document.getElementById('analysis-template').innerHTML
        );

        // Parse URL parameters to get the event ID
        function getEventIdFromUrl() {
            const params = new URLSearchParams(window.location.search);
            return params.get('event');
        }

        // Update URL without reloading the page
        function updateUrl(eventId) {
            const newUrl = eventId 
                ? `${window.location.pathname}?event=${eventId}`
                : window.location.pathname;
            window.history.pushState({ eventId }, '', newUrl);
        }

        // Load the event menu using API data
        async function loadEventMenu() {
            try {
                const apiAvailable = await checkApiConnection();
                if (!apiAvailable) throw new Error('API not available');

                const response = await fetch(`${API_URL}/api/event-details`);
                if (!response.ok) throw new Error('Failed to fetch events');
                
                const data = await response.json();
                if (!data.success) throw new Error(data.error);
                
                const events = data.events;
                const selectedId = getEventIdFromUrl() || events[0].id.toString();
                
                // Add selected state to events
                const eventsWithState = events.map(event => ({
                    ...event,
                    selected: event.id === parseInt(selectedId)
                }));
                
                // Render desktop menu
                const eventMenu = document.getElementById('event-menu');
                if (eventMenu) {
                    const data = {
                        events: eventsWithState,
                        selectedEventId: selectedId
                    };
                    eventMenu.innerHTML = menuTemplate(data);
                    
                    // Add click handlers for each event button
                    eventMenu.querySelectorAll('button').forEach(button => {
                        button.addEventListener('click', () => loadEvent(button.dataset.eventId));
                    });
                }
                
                // Render mobile dropdown menu
                const eventSelect = document.getElementById('event-select');
                if (eventSelect) {
                    const selectTemplate = Handlebars.compile(
                        document.getElementById('event-select-template').innerHTML
                    );
                    eventSelect.innerHTML = selectTemplate({ events: eventsWithState });
                    
                    // Add change handler for mobile dropdown
                    eventSelect.addEventListener('change', (e) => {
                        loadEvent(e.target.value);
                    });
                }
                
                // Load initial event
                loadEvent(selectedId);
                
            } catch (error) {
                console.error('Error loading event menu:', error);
                const errorMessage = `
                    <div class="text-red-500 p-4">
                        Error loading events: ${error.message}
                    </div>
                `;
                if (eventMenu) eventMenu.innerHTML = errorMessage;
                if (eventSelect) eventSelect.innerHTML = errorMessage;
            }
        }

        // Fetch and display event details for a given event ID
        async function loadEvent(eventId) {
            if (currentEventId === eventId) return;
            currentEventId = eventId;
            
            try {
                // Start fade out animation
                analysisContent.style.opacity = '0';
                
                // Fetch event details from API
                const response = await fetch(`${API_URL}/api/event-details/${eventId}`);
                if (!response.ok) throw new Error('Failed to fetch event details');
                
                const data = await response.json();
                if (!data.success) throw new Error(data.error);
                
                const eventData = data.event;
                
                // Update URL to reflect current event
                updateUrl(eventId);
                
                // Update menu selection styling
                document.querySelectorAll('#event-menu button').forEach(button => {
                    button.classList.toggle('bg-blue-100', 
                        button.dataset.eventId === eventId);
                });
                
                // Render new content after a short delay for fade effect
                setTimeout(() => {
                    analysisContent.innerHTML = analysisTemplate(eventData);
                    analysisContent.style.opacity = '1';
                }, 300);
                
            } catch (error) {
                console.error('Error loading event:', error);
                analysisContent.innerHTML = `
                    <div class="bg-white p-8 rounded-lg shadow-lg">
                        <div class="text-red-500">Error loading event details: ${error.message}</div>
                    </div>
                `;
                analysisContent.style.opacity = '1';
            }
        }

        // Handle browser back/forward navigation events
        window.addEventListener('popstate', (event) => {
            if (event.state && event.state.eventId) {
                loadEvent(event.state.eventId);
            }
        });

        // Initialize the analysis page by loading the event menu
        loadEventMenu();
    }
  
    /* -----------------------------
       Fetch Data and Render Templates (Timeline & Slider)
       ----------------------------- */
    fetch("data/timeline.json")
      .then(response => response.json())
      .then(data => {
        // Render the milestones slider if present
        const milestonesSlider = document.getElementById("milestones-slider");
        if (milestonesSlider) {
          const milestoneTemplate = Handlebars.compile(
            document.getElementById("milestone-template").innerHTML
          );

          milestonesSlider.innerHTML = milestoneTemplate({ milestones: data });

          let startIndex = 0;
          const totalItems = data.length;
          const maxIndex = totalItems; // Changed to allow sliding to last card
          const cardWidth = milestonesSlider.children[0].offsetWidth;
          const gap = 24;
          const slideDistance = cardWidth + gap;
          
          function updateSlider(direction) {
            milestonesSlider.style.transition = 'transform 0.3s ease';
            
            if (direction === 'next') {
              startIndex = startIndex >= maxIndex ? 0 : startIndex + 1;
            } else {
              startIndex = startIndex <= 0 ? maxIndex : startIndex - 1;
            }
            
            milestonesSlider.style.transform = `translateX(-${startIndex * slideDistance}px)`;
          }
          
          const prevButton = document.querySelector(".slider__button--prev");
          const nextButton = document.querySelector(".slider__button--next");
          
          if (prevButton) prevButton.addEventListener("click", () => updateSlider('prev'));
          if (nextButton) nextButton.addEventListener("click", () => updateSlider('next'));
          
          // Enable auto-scroll only on larger screens (desktop)
          if (window.innerWidth >= 768) {
            setInterval(() => updateSlider('next'), 5000);
          }
        }
  
        // ---- Render Timeline Events on Timeline Page ----
        // Render timeline events with animation delays
        const timelineEvents = document.getElementById("timeline-events");
        if (timelineEvents) {
          const timelineTemplateSource = document.getElementById("timeline-template").innerHTML;
          const timelineTemplate = Handlebars.compile(timelineTemplateSource);
          
          // Add animation delay to each timeline event
          const eventsWithAnimation = data.map((event, index) => ({
            ...event,
            animationDelay: `${index * 0.2}s`
          }));
          
          timelineEvents.innerHTML = timelineTemplate({ events: eventsWithAnimation });
        }
      })
      .catch(error => console.error("Error fetching timeline data:", error))
      .finally(() => {
        // Hide the loading spinner after data is loaded
        const loadingEl = document.getElementById("loading");
        if (loadingEl) loadingEl.classList.add("hidden");
      });
  
    /* -----------------------------
       Mobile Menu Functionality
       ----------------------------- */
    const menuToggle = document.getElementById('menu-toggle');
    const mobileMenu = document.querySelector('.mobile-menu');

    if (menuToggle && mobileMenu) {
        menuToggle.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
            mobileMenu.classList.toggle('active');
        });

        // Close the mobile menu when clicking outside of it
        document.addEventListener('click', (e) => {
            if (!menuToggle.contains(e.target) && !mobileMenu.contains(e.target)) {
                mobileMenu.classList.add('hidden');
                mobileMenu.classList.remove('active');
            }
        });

        // Close the mobile menu when clicking on a link inside it
        mobileMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.add('hidden');
                mobileMenu.classList.remove('active');
            });
        });
    }

    /* -----------------------------
       Knowledge Hub Page Functionality
       ----------------------------- */
    if (document.getElementById('knowledge-hub-content')) {
        // Helper function to parse query parameters, defaulting to "1" if not provided
        function getEventIdFromUrl() {
          const params = new URLSearchParams(window.location.search);
          return params.get('event') || "1";
        }
      
        // Helper function to render a Handlebars template into a target element
        function renderTemplate(templateId, data, targetId) {
          const source = document.getElementById(templateId).innerHTML;
          const template = Handlebars.compile(source);
          document.getElementById(targetId).innerHTML = template(data);
        }
      
        // Fetch event details from the API
        async function fetchEventDetails() {
          const response = await fetch(`${API_URL}/api/event-details`);
          const data = await response.json();
          if (!data.success) throw new Error(data.error);
          return data.events;
        }
      
        // Load research data for the selected event
        async function loadResearch(eventId) {
          try {
            const response = await fetch(`${API_URL}/api/research?event=${eventId}`);
            const data = await response.json();
            if (!data.success) throw new Error(data.error);
            renderTemplate('research-template', { articles: data.articles }, 'research-content');
          } catch (error) {
            document.getElementById('research-content').innerHTML = `<p class="text-red-500">Error loading research: ${error.message}</p>`;
          }
        }
      
        // Load multimedia content for the selected event using the API endpoint
        async function loadMultimedia(eventId) {
          try {
            const response = await fetch(`${API_URL}/api/multimedia?event=${eventId}`);
            const data = await response.json();
            if (!data.success) throw new Error(data.error);
            renderTemplate('multimedia-template', { videos: data.multimedia }, 'multimedia-content');
          } catch (error) {
            document.getElementById('multimedia-content').innerHTML = `<p class="text-red-500">Error loading multimedia: ${error.message}</p>`;
          }
        }
      
        // Load notable figures for the selected event
        async function loadFigures(eventId) {
          try {
            const response = await fetch(`${API_URL}/api/notable-figures?event=${eventId}`);
            const data = await response.json();
            if (!data.success) throw new Error(data.error);
            renderTemplate('figures-template', { figures: data.figures }, 'figures-content');
          } catch (error) {
            document.getElementById('figures-content').innerHTML = `<p class="text-red-500">Error loading figures: ${error.message}</p>`;
          }
        }
      
        // Load all Knowledge Hub data for the selected event
        async function loadKnowledgeHub(eventId) {
          // Show the loading indicator
          document.getElementById('loading').classList.remove('hidden');
          try {
            const events = await fetchEventDetails();
            // If no event is provided, default to the first event (or in our case event "1")
            const selectedEventId = eventId || events[0].id.toString();
      
            // Mark the selected event in the event menu and mobile select
            const eventsWithState = events.map(ev => ({
              ...ev,
              selected: ev.id === parseInt(selectedEventId)
            }));
            renderTemplate('event-menu-template', { events: eventsWithState }, 'event-menu');
            renderTemplate('event-select-template', { events: eventsWithState }, 'event-select');
      
            // Update header information by rendering the event header template
            const currentEvent = events.find(ev => ev.id === parseInt(selectedEventId));
            if (currentEvent) {
              renderTemplate('event-header-template', currentEvent, 'event-header');
            }
      
            // Load dynamic sections concurrently
            await Promise.all([
              loadResearch(selectedEventId),
              loadMultimedia(selectedEventId),
              loadFigures(selectedEventId),
              loadNews(selectedEventId)
            ]);
          } catch (error) {
            document.getElementById('knowledge-hub-content').innerHTML = `<p class="text-red-500 p-4">Error loading event data: ${error.message}</p>`;
          } finally {
            // Hide the loading indicator
            document.getElementById('loading').classList.add('hidden');
          }
        }
      
        // If the URL doesn't have an event parameter, set it to event=1
        const currentUrl = new URL(window.location);
        if (!currentUrl.searchParams.has('event')) {
          currentUrl.searchParams.set('event', "1");
          window.history.replaceState({}, "", currentUrl);
        }
      
        const eventIdFromUrl = getEventIdFromUrl();
        loadKnowledgeHub(eventIdFromUrl);
      
        // Desktop event menu: handle click events on event buttons
        const eventMenu = document.getElementById('event-menu');
        if (eventMenu) {
          eventMenu.addEventListener('click', event => {
            const btn = event.target.closest('button');
            if (btn) {
              const selectedId = btn.dataset.eventId;
              window.history.pushState({ eventId: selectedId }, '', `knowledge-hub.html?event=${selectedId}`);
              loadKnowledgeHub(selectedId);
            }
          });
        }
      
        // Mobile dropdown: handle change events on event selection
        const eventSelect = document.getElementById('event-select');
        if (eventSelect) {
          eventSelect.addEventListener('change', e => {
            const selectedId = e.target.value;
            window.history.pushState({ eventId: selectedId }, '', `knowledge-hub.html?event=${selectedId}`);
            loadKnowledgeHub(selectedId);
          });
        }
      
        // Handle browser navigation (back/forward)
        window.addEventListener('popstate', (e) => {
          if (e.state && e.state.eventId) {
            loadKnowledgeHub(e.state.eventId);
          }
        });
    }
  
    /* -----------------------------
       Modal Functionality for Citations
       ----------------------------- */
    // Event delegation for showing the modal when an info icon is clicked.
    document.addEventListener("click", (event) => {
      const infoButton = event.target.closest(".info-btn");
      if (infoButton) {
        event.preventDefault();
        const citationText = infoButton.getAttribute("data-citation") || "No citation available";
        document.getElementById("citationDetails").textContent = citationText;
        document.getElementById("citationModal").classList.remove("hidden");
      }
    });
  
    // Get the modal container.
    const citationModal = document.getElementById("citationModal");
  
    // Attach a single event listener on the modal container to handle close events.
    if (citationModal) {
      citationModal.addEventListener("click", (event) => {
        // If the user clicks on the element with ID "closeCitationModal" or outside the modal content, close the modal.
        if (
          event.target.closest("#closeCitationModal") ||
          event.target === citationModal
        ) {
          citationModal.classList.add("hidden");
        }
      });
    }
});

/* ==========================================================================
   Tab Switching Functionality for Knowledge Hub Page
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
  const tabButtons = document.querySelectorAll('#tab-navigation .tab-button');
  const tabSections = document.querySelectorAll('.tab-section');
  
  function showTab(tabName) {
    // Toggle tab content visibility
    tabSections.forEach(section => {
      section.classList.toggle('hidden', section.id !== `${tabName}-section`);
    });
    
    // Update active state on tab buttons
    tabButtons.forEach(button => {
      if (button.dataset.tab === tabName) {
        button.classList.add('text-blue-600', 'border-blue-600');
        button.classList.remove('text-gray-500', 'border-transparent');
      } else {
        button.classList.remove('text-blue-600', 'border-blue-600');
        button.classList.add('text-gray-500', 'border-transparent');
      }
    });
  }
  
  // Attach click events to each tab button
  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      showTab(button.dataset.tab);
    });
  });
  
  // Set the default tab to "research" on page load
  showTab('research');
});

/* ==========================================================================
   Function to Load News & Articles Data for the Selected Event
   ========================================================================== */
async function loadNews(eventId) {
  try {
    const response = await fetch(`${API_URL}/api/news-articles?event=${eventId}`);
    const data = await response.json();
    if (!data.success) throw new Error(data.error);
    renderTemplate('news-template', { articles: data.articles }, 'news-content');
  } catch (error) {
    document.getElementById('news-content').innerHTML = `<p class="text-red-500">Error loading news & articles: ${error.message}</p>`;
  }
}
