# Implementation Plan: Tier Maker Overview Mode

## Overview

This implementation plan creates the overview mode feature from scratch, building incrementally on the existing TierMaker architecture. The current codebase has no overview mode implementation, so all components need to be created: OverviewMode class, QuickClassificationModal functionality, and comprehensive testing.

## Tasks

- [ ] 1. Create OverviewMode class foundation
  - [ ] 1.1 Create new OverviewMode class file (src/js/overviewMode.js)
    - Implement basic class structure with constructor
    - Add core methods: toggle(), enter(), exit(), isActive()
    - Set up state management for overview mode
    - _Requirements: 1.1, 1.3_

  - [ ] 1.2 Integrate OverviewMode with TierMaker class
    - Import OverviewMode in tierMaker.js
    - Initialize OverviewMode instance in TierMaker constructor
    - Add overview mode methods to TierMaker class
    - _Requirements: 1.1, 1.3_

  - [ ]* 1.3 Write property test for overview mode state management
    - **Property 4: Mode State Consistency**
    - **Validates: Requirements 1.4**

- [ ] 2. Implement overview mode CSS styles and layout
  - [ ] 2.1 Add overview mode CSS classes to styles.css
    - Create .overview-mode class for body/container
    - Add scaling transforms for tier container
    - Implement sidebar visibility adjustments
    - _Requirements: 1.1, 1.2, 5.1_

  - [ ] 2.2 Implement viewport scaling calculations
    - Add calculateOptimalScale() method to OverviewMode
    - Calculate scale factor based on viewport dimensions
    - Apply CSS transforms to fit tier container in viewport
    - _Requirements: 1.1_

  - [ ]* 2.3 Write property test for viewport fitting
    - **Property 1: Overview Mode Viewport Fitting**
    - **Validates: Requirements 1.1**

  - [ ]* 2.4 Write property test for dual component visibility
    - **Property 2: Dual Component Visibility**
    - **Validates: Requirements 1.2**

- [ ] 3. Add overview mode toggle button and UI
  - [ ] 3.1 Add overview mode button to Renderer class
    - Extend renderSidebar() to include overview mode button
    - Style button consistently with existing nav items
    - _Requirements: 1.1_

  - [ ] 3.2 Implement mode transition logic in OverviewMode
    - Store original layout state before entering overview mode
    - Restore layout state when exiting overview mode
    - Add smooth transitions between modes
    - _Requirements: 1.3_

  - [ ] 3.3 Add visual feedback for active overview mode
    - Update button appearance when overview mode is active
    - Add mode indicator to UI
    - _Requirements: 1.4_

  - [ ]* 3.4 Write property test for layout round trip
    - **Property 3: Layout Round Trip**
    - **Validates: Requirements 1.3**

- [ ] 4. Checkpoint - Ensure basic overview mode functionality works
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 5. Create QuickClassificationModal class
  - [ ] 5.1 Create new QuickClassificationModal class file (src/js/quickClassificationModal.js)
    - Implement basic class test for modal element display
    - **Property 7: Modal Element Display**
    - **Validates: Requirements 2.2, 3.1**

  - [ ]* 5.4 Write property test for classification button completeness
    - **Property 8: Classification Button Completeness**
    - **Validates: Requirements 2.3**

- [ ] 6. Implement element pool double-click functionality
  - [ ] 6.1 Add double-click event handlers to element pool
    - Bind double-click events to elements in pool
    - Trigger quick classification modal on double-click
    - _Requirements: 2.1_

  - [ ]* 6.2 Write property test for double-click modal activation
    - **Property 6: Double-Click Modal Activation**
    - **Validates: Requirements 2.1**

  - [ ] 6.3 Implement element classification logic
    - Handle classification button clicks
    - Move elements to selected tiers
    - Close modal after classification
    - _Requirements: 2.4_

  - [ ]* 6.4 Write property test for classification action completeness
    - **Property 9: Classification Action Completeness**
    - **Validates: Requirements 2.4**

- [ ] 7. Implement modal interaction features
  - [ ] 7.1 Add keyboard shortcut support
    - Bind 1-5 keys for quick tier classification
    - Handle keyboard events when modal is active
    - _Requirements: 3.5_

  - [ ]* 7.2 Write property test for keyboard shortcut functionality
    - **Property 15: Keyboard Shortcut Functionality**
    - **Validates: Requirements 3.5**

  - [ ] 7.3 Implement modal cancellation handling
    - Handle modal close without classification
    - Preserve element state on cancellation
    - _Requirements: 2.5_

  - [ ]* 7.4 Write property test for modal cancellation preservation
    - **Property 10: Modal Cancellation Preservation**
    - **Validates: Requirements 2.5**

- [ ] 8. Implement cross-mode compatibility
  - [ ] 8.1 Ensure drag-drop functionality in overview mode
    - Test and maintain existing drag-drop behavior
    - Handle drag operations with scaled tier container
    - _Requirements: 1.5_

  - [ ]* 8.2 Write property test for drag-drop functionality preservation
    - **Property 5: Drag-Drop Functionality Preservation**
    - **Validates: Requirements 1.5**

  - [ ] 8.3 Maintain overview mode state during modal operations
    - Preserve overview mode when modal is open
    - Handle state synchronization between components
    - _Requirements: 2.6_

  - [ ]* 8.4 Write property test for overview mode state persistence
    - **Property 11: Overview Mode State Persistence**
    - **Validates: Requirements 2.6**

- [ ] 9. Checkpoint - Ensure modal functionality works correctly
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 10. Implement responsive design and mobile support
  - [ ] 10.1 Add mobile-specific overview mode layouts
    - Adapt overview mode for mobile viewport sizes
    - Ensure touch accessibility for classification modal
    - _Requirements: 5.2, 5.4_

  - [ ]* 10.2 Write property test for mobile layout adaptation
    - **Property 20: Mobile Layout Adaptation**
    - **Validates: Requirements 5.2**

  - [ ]* 10.3 Write property test for touch device accessibility
    - **Property 21: Touch Device Accessibility**
    - **Validates: Requirements 5.4**

- [ ] 11. Implement styling consistency and visual feedback
  - [ ] 11.1 Ensure tier color consistency across modes
    - Match classification button colors to tier colors
    - Maintain color consistency between overview and present modes
    - _Requirements: 3.2, 3.3_

  - [ ]* 11.2 Write property test for tier color consistency
    - **Property 12: Tier Color Consistency**
    - **Validates: Requirements 3.2**

  - [ ]* 11.3 Write property test for cross-mode style consistency
    - **Property 13: Cross-Mode Style Consistency**
    - **Validates: Requirements 3.3, 4.4**

  - [ ] 11.4 Implement classification feedback animations
    - Add visual feedback for successful classifications
    - Ensure feedback appears before modal closes
    - _Requirements: 3.6_

  - [ ]* 11.5 Write property test for classification feedback timing
    - **Property 16: Classification Feedback Timing**
    - **Validates: Requirements 3.6**

- [ ] 12. Implement performance optimizations and error handling
  - [ ] 12.1 Add image preloading for quick modal display
    - Preload element images for faster modal rendering
    - Implement image cache management
    - _Requirements: 6.4_

  - [ ]* 12.2 Write property test for image preloading
    - **Property 23: Image Preloading**
    - **Validates: Requirements 6.4**

  - [ ] 12.3 Add loading states for asynchronous operations
    - Display loading indicators during image loading
    - Handle loading states for modal operations
    - _Requirements: 6.5_

  - [ ]* 12.4 Write property test for loading state indication
    - **Property 24: Loading State Indication**
    - **Validates: Requirements 6.5**

  - [ ] 12.5 Implement error handling and fallbacks
    - Handle viewport calculation failures
    - Manage image loading errors
    - Provide graceful degradation for unsupported features

- [ ] 13. Implement backward compatibility and present mode integration
  - [ ] 13.1 Ensure present mode functionality preservation
    - Verify existing present mode behavior is unchanged
    - Test present mode after overview mode implementation
    - _Requirements: 4.1_

  - [ ]* 13.2 Write property test for present mode backward compatibility
    - **Property 17: Present Mode Backward Compatibility**
    - **Validates: Requirements 4.1**

  - [ ] 13.3 Implement mode differentiation UI
    - Provide clear visual distinction between modes
    - Update mode indicators and button states
    - _Requirements: 4.2_

  - [ ]* 13.4 Write property test for mode differentiation
    - **Property 18: Mode Differentiation**
    - **Validates: Requirements 4.2**

- [ ] 14. Final integration and comprehensive testing
  - [ ] 14.1 Wire all components together
    - Integrate OverviewMode with TierMaker class
    - Connect QuickClassificationModal with element pool
    - Ensure all event handlers are properly bound
    - _Requirements: All requirements_

  - [ ]* 14.2 Write integration tests for complete workflows
    - Test complete overview mode activation and usage
    - Test element classification workflows
    - Test mode transitions and state management

  - [ ] 14.3 Add comprehensive unit tests for edge cases
    - Test empty element pools
    - Test single-tier configurations
    - Test error conditions and recovery

- [ ] 15. Final checkpoint - Ensure all functionality works end-to-end
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties using fast-check library
- Unit tests validate specific examples and edge cases
- The implementation maintains backward compatibility with existing functionality