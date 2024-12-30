# Code Citations

## License: unknown

https://github.com/zzzmj/mo-app/tree/579b0dcb70b1dbdb4453a9e8a41a1d8f911ed29e/components/ui/AutoResizeTextarea.tsx

```
HTMLTextAreaElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [
```
