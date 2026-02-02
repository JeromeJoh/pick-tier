# Design Document: Tier Maker Overview Mode

## Overview

This design document outlines the implementation of an Overview Mode for the tier maker application. The Overview Mode addresses the limitation of the current Present Mode by providing a comprehensive view that shows the complete tier structure alongside the element pool in a single viewport. This enhancement will enable users to conduct effective demonstrations and screen recordings while maintaining full functionality for element classification.

The design focuses on extending the existing architecture with minimal disruption, reusing established patterns and CSS variables to maintain consistency with the current design language.

## Architecture

### Component Structure

The Overview Mode will be implemented as an extension to the existing TierMaker class, following the established modular pattern:

```
TierMaker
├── OverviewMode (new)
├── PresentMode (existing)
├── ModalManager (extended)
├── DragHandler (unchanged)
├── Renderer (extended)
└── StorageManager (unchanged)
```

### State Management

The application will maintain three distinct view states:
- **Normal Mode**: Default layout with sidebar and scrollable main content
- **Overview Mode**: Scaled tier container with visible element pool
- **Present Mode**: Existing sequential element presentation (retained for compatibility)

### Integration Points

1. **TierMaker Class**: Add overview mode toggle and state management
2. **Renderer Class**: Extend to support overview mode layout rendering
3. **ModalManager Class**: Add quick classification modal support
4. **CSS**: Add overview mode styles using existing variables

## Components and Interfaces

### OverviewMode Class

```javascript
class OverviewMode {
  constructor(tierMaker)
  
  // Core functionality
  toggle()                    // Toggle overview mode on/off
  enter()                     // Enter overview mode
  exit()                      // Exit overview mode
  
  // Layout management
  calculateOptimalScale()     // Calculate tier container scaling
  updateLayout()              // Apply overview mode layout
  restoreLayout()             // Restore normal layout
  
  // Event handling
  bindEvents()                // Bind overview mode events
  unbindEvents()              // Unbind overview mode events
  
  // State management
  isActive()                  // Check if overview mode is active
  cleanup()                   // Clean up resources
}
```

### QuickClassificationModal Class

```javascript
class QuickClassificationModal {
  constructor(tierMaker)
  
  // Modal lifecycle
  show(element)               // Show modal for element
  hide()                      // Hide modal
  
  // Classification actions
  classifyElement(tierId)     // Classify element to tier
  renderTierButtons()         // Render classification buttons
  
  // Event handling
  bindKeyboardEvents()        // Bind keyboard shortcuts (1-5)
  unbindKeyboardEvents()      // Unbind keyboard events
  
  // UI updates
  updateElementDisplay()      // Update element image and info
  showClassificationFeedback() // Show success feedback
}
```

### Extended TierMaker Interface

```javascript
// New methods added to TierMaker class
toggleOverviewMode()          // Toggle overview mode
enterOverviewMode()           // Enter overview mode
exitOverviewMode()            // Exit overview mode
showQuickClassificationModal(elementId) // Show classification modal
```

### Extended Renderer Interface

```javascript
// New methods added to Renderer class
renderOverviewModeButton()    // Render overview mode toggle button
renderQuickClassificationModal() // Render classification modal HTML
updateElementPoolForOverview() // Update element pool with double-click handlers
```

## Data Models

### OverviewMode State

```javascript
{
  isActive: boolean,           // Whether overview mode is active
  originalLayout: {            // Store original layout for restoration
    sidebarState: boolean,
    mainContentMargin: string,
    tierContainerTransform: string
  },
  scaleFactor: number,         // Current scale factor for tier container
  transitionDuration: number   // Animation duration in milliseconds
}
```

### QuickClassificationModal State

```javascript
{
  isVisible: boolean,          // Whether modal is currently visible
  currentElement: {            // Element being classified
    id: string,
    name: string,
    description: string,
    src: string
  },
  keyboardEventsActive: boolean // Whether keyboard shortcuts are active
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Overview Mode Viewport Fitting
*For any* viewport dimensions, when overview mode is activated, the tier container should be scaled to fit entirely within those viewport bounds.
**Validates: Requirements 1.1**

### Property 2: Dual Component Visibility
*For any* screen size and content amount, when overview mode is active, both the tier container and element pool should be simultaneously visible in the viewport.
**Validates: Requirements 1.2**

### Property 3: Layout Round Trip
*For any* initial layout state, entering overview mode and then exiting should restore the exact original layout and scaling.
**Validates: Requirements 1.3**

### Property 4: Mode State Consistency
*For any* system state, the visual feedback indicators should accurately reflect whether overview mode is currently active or inactive.
**Validates: Requirements 1.4**

### Property 5: Drag-Drop Functionality Preservation
*For any* drag-and-drop operation, the result should be identical whether performed in normal mode or overview mode.
**Validates: Requirements 1.5**

### Property 6: Double-Click Modal Activation
*For any* element in the element pool, double-clicking should consistently open the quick classification modal.
**Validates: Requirements 2.1**

### Property 7: Modal Element Display
*For any* element, when the quick classification modal opens, the element image should be displayed at optimal size for the current viewport.
**Validates: Requirements 2.2, 3.1**

### Property 8: Classification Button Completeness
*For any* tier configuration, the quick classification modal should display classification buttons for all available tiers.
**Validates: Requirements 2.3**

### Property 9: Classification Action Completeness
*For any* element and tier combination, clicking a classification button should move the element to the selected tier and close the modal.
**Validates: Requirements 2.4**

### Property 10: Modal Cancellation Preservation
*For any* element, opening and closing the quick classification modal without classification should leave the element unchanged in the pool.
**Validates: Requirements 2.5**

### Property 11: Overview Mode State Persistence
*For any* modal operation, the overview mode state should remain unchanged while the quick classification modal is open.
**Validates: Requirements 2.6**

### Property 12: Tier Color Consistency
*For any* tier configuration, the classification buttons in the quick modal should use colors that exactly match the corresponding tier colors.
**Validates: Requirements 3.2**

### Property 13: Cross-Mode Style Consistency
*For any* common UI element, the styling should be identical between overview mode and present mode.
**Validates: Requirements 3.3, 4.4**

### Property 14: Element Information Display
*For any* element with available metadata, the quick classification modal should display the element name and description.
**Validates: Requirements 3.4**

### Property 15: Keyboard Shortcut Functionality
*For any* tier configuration with 5 or fewer tiers, keyboard shortcuts (1-5 keys) should correctly classify elements to the corresponding tiers.
**Validates: Requirements 3.5**

### Property 16: Classification Feedback Timing
*For any* classification action, visual feedback should appear before the modal closes.
**Validates: Requirements 3.6**

### Property 17: Present Mode Backward Compatibility
*For any* present mode operation, the behavior should be identical before and after overview mode implementation.
**Validates: Requirements 4.1**

### Property 18: Mode Differentiation
*For any* system state, when both modes are available, users should be able to clearly distinguish which mode is currently active.
**Validates: Requirements 4.2**

### Property 19: CSS Variable Reuse
*For any* new styling, existing CSS variables should be used where applicable to maintain consistency.
**Validates: Requirements 5.1**

### Property 20: Mobile Layout Adaptation
*For any* mobile viewport dimensions, overview mode should adapt the layout appropriately for the screen size.
**Validates: Requirements 5.2**

### Property 21: Touch Device Accessibility
*For any* touch interaction on the quick classification modal, the interface should respond correctly to touch events.
**Validates: Requirements 5.4**

### Property 22: Design Language Preservation
*For any* new UI element, the color scheme and design patterns should match the existing design language.
**Validates: Requirements 5.5**

### Property 23: Image Preloading
*For any* element, images should be preloaded before the quick classification modal is displayed to ensure immediate visibility.
**Validates: Requirements 6.4**

### Property 24: Loading State Indication
*For any* asynchronous operation, appropriate loading indicators should be displayed during the operation.
**Validates: Requirements 6.5**

## Error Handling

### Overview Mode Errors

1. **Viewport Calculation Failures**
   - Fallback to minimum safe scale factor (0.5)
   - Display warning message to user
   - Allow manual scale adjustment

2. **Layout Restoration Failures**
   - Store multiple layout snapshots for redundancy
   - Implement progressive fallback to default layout
   - Log errors for debugging

3. **Scale Factor Edge Cases**
   - Minimum scale: 0.3 (30% of original size)
   - Maximum scale: 1.0 (original size)
   - Handle zero or negative viewport dimensions

### Quick Classification Modal Errors

1. **Image Loading Failures**
   - Display placeholder image with error message
   - Provide retry mechanism
   - Continue with classification functionality

2. **Modal State Conflicts**
   - Prevent multiple modals from opening simultaneously
   - Implement modal queue for rapid interactions
   - Clean up event listeners on modal close

3. **Classification Failures**
   - Validate tier existence before classification
   - Provide user feedback on failures
   - Maintain element in pool on classification errors

### Performance Safeguards

1. **Memory Management**
   - Limit number of preloaded images (max 50)
   - Implement image cache cleanup
   - Monitor DOM element count in overview mode

2. **Animation Performance**
   - Use CSS transforms for hardware acceleration
   - Implement reduced motion preferences
   - Fallback to instant transitions on low-performance devices

## Testing Strategy

### Dual Testing Approach

The testing strategy employs both unit tests and property-based tests to ensure comprehensive coverage:

- **Unit Tests**: Verify specific examples, edge cases, and error conditions
- **Property Tests**: Verify universal properties across all inputs using randomized testing
- Both approaches are complementary and necessary for complete validation

### Property-Based Testing Configuration

- **Testing Library**: fast-check (JavaScript property-based testing library)
- **Test Iterations**: Minimum 100 iterations per property test
- **Test Tagging**: Each property test tagged with format: **Feature: tier-maker-overview-mode, Property {number}: {property_text}**

### Unit Testing Focus Areas

1. **Specific Examples**
   - Overview mode activation with known viewport sizes
   - Modal opening with specific element configurations
   - Classification with predefined tier setups

2. **Edge Cases**
   - Very small viewport dimensions
   - Empty element pools
   - Single-tier configurations
   - Missing element metadata

3. **Error Conditions**
   - Invalid element IDs
   - Corrupted layout state
   - Network failures during image loading

4. **Integration Points**
   - Interaction between overview mode and existing drag-drop
   - Modal integration with keyboard event handling
   - State synchronization between components

### Property Testing Focus Areas

1. **Universal Behaviors**
   - Layout calculations across all viewport sizes
   - Modal functionality across all element types
   - State preservation across all mode transitions

2. **Randomized Input Coverage**
   - Random viewport dimensions (100x100 to 4000x3000)
   - Random element configurations (0-100 elements)
   - Random tier setups (1-10 tiers with random colors)
   - Random element metadata combinations

3. **Cross-Browser Compatibility**
   - CSS transform calculations across browsers
   - Event handling consistency
   - Performance characteristics

### Test Implementation Guidelines

1. **Property Test Structure**
   ```javascript
   // Example property test structure
   fc.test('Feature: tier-maker-overview-mode, Property 1: Overview Mode Viewport Fitting', 
     fc.record({
       width: fc.integer(100, 4000),
       height: fc.integer(100, 3000),
       tierCount: fc.integer(1, 10)
     }), 
     (viewport) => {
       // Test implementation
     }
   );
   ```

2. **Mock Strategy**
   - Minimal mocking approach - test real functionality where possible
   - Mock only external dependencies (DOM measurements, image loading)
   - Use dependency injection for testable components

3. **Performance Testing**
   - Measure layout calculation times
   - Monitor memory usage during mode transitions
   - Validate 60fps during animations (where measurable)

### Continuous Integration

1. **Automated Test Execution**
   - Run all tests on every commit
   - Property tests with reduced iteration count (25) for CI speed
   - Full property test suite (100 iterations) on release branches

2. **Cross-Browser Testing**
   - Chrome, Firefox, Safari, Edge
   - Mobile browsers (iOS Safari, Chrome Mobile)
   - Different screen resolutions and pixel densities

3. **Performance Benchmarks**
   - Layout calculation performance thresholds
   - Memory usage limits
   - Animation frame rate monitoring