import React, { useState, useEffect, useRef, useMemo } from 'react';
import { cn } from '@/lib/utils';

/**
 * VirtualList component for rendering large lists efficiently
 * Only renders visible items plus a buffer for smooth scrolling
 */
const VirtualList = React.memo(({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  className,
  overscan = 5,
  onScroll,
  ...props
}) => {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef(null);

  // Calculate visible range
  const visibleRange = useMemo(() => {
    const start = Math.floor(scrollTop / itemHeight);
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const end = Math.min(start + visibleCount + overscan * 2, items.length);

    return {
      start: Math.max(0, start - overscan),
      end: end,
      totalHeight: items.length * itemHeight,
      offsetY: Math.max(0, (start - overscan) * itemHeight)
    };
  }, [scrollTop, itemHeight, containerHeight, items.length, overscan]);

  // Handle scroll events
  const handleScroll = (e) => {
    const newScrollTop = e.target.scrollTop;
    setScrollTop(newScrollTop);
    onScroll?.(newScrollTop);
  };

  // Get visible items
  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.start, visibleRange.end).map((item, index) => ({
      item,
      index: visibleRange.start + index,
      style: {
        height: itemHeight,
        position: 'absolute',
        top: (visibleRange.start + index) * itemHeight - visibleRange.offsetY,
        width: '100%'
      }
    }));
  }, [items, visibleRange, itemHeight]);

  return (
    <div
      ref={containerRef}
      className={cn('overflow-auto', className)}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
      {...props}
    >
      <div style={{ height: visibleRange.totalHeight, position: 'relative' }}>
        {visibleItems.map(({ item, index, style }) => (
          <div key={index} style={style}>
            {renderItem(item, index)}
          </div>
        ))}
      </div>
    </div>
  );
});

VirtualList.displayName = 'VirtualList';

export default VirtualList;
