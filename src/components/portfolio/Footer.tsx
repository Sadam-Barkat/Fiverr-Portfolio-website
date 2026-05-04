export default function Footer() {
  return (
    <footer className="py-12 border-t border-border/50">
      <div className="container text-center">
        <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
          Project write-ups are generalized to protect client confidentiality. For proposals, files,
          and messaging, continue on the marketplace where we connected.
        </p>
        <p className="text-xs text-muted-foreground/60 mt-3">
          © {new Date().getFullYear()} Work samples. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
